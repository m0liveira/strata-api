/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto } from './dto/sync.dto';
import { SyncGateway } from './sync.gateway';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private syncGateway: SyncGateway,
  ) {}

  async push(userId: number, data: SyncPushDto) {
    const { changes } = data;
    const affectedTripIds = new Set<string>();

    // Função auxiliar para recolher os trip_ids que sofreram alterações
    const collectTripIds = (tableChanges: any) => {
      if (!tableChanges) return;
      tableChanges.created?.forEach((item: any) => item.trip_id && affectedTripIds.add(item.trip_id));
      tableChanges.updated?.forEach((item: any) => item.trip_id && affectedTripIds.add(item.trip_id));
    };

    collectTripIds(changes.trips);
    collectTripIds(changes.destinations);
    collectTripIds(changes.locations);
    collectTripIds(changes.expenses);

    // No caso de viagens apagadas, o ID vem diretamente no array de deleted
    if (changes.trips?.deleted) {
      changes.trips.deleted.forEach((id: string) => affectedTripIds.add(id));
    }

    await this.prisma.$transaction(async (tx) => {
      if (changes.trips) {
        await this.processModel(tx.trip, 'trip_id', changes.trips, async (item) => {
          await tx.trip.create({
            data: {
              ...item,
              members: { create: { user_id: userId, status: 'ACCEPTED' } },
            },
          });
        });
      }

      if (changes.destinations) {
        await this.processModel(tx.destination, 'destination_id', changes.destinations);
      }

      if (changes.locations) {
        await this.processModel(tx.location, 'location_id', changes.locations);
      }

      if (changes.expenses) {
        await this.processModel(tx.expense, 'expense_id', changes.expenses);
      }
    });

    // Depois de a transação ter sucesso, avisa os outros membros
    affectedTripIds.forEach((tripId) => {
      this.syncGateway.notifySyncNeeded(tripId);
    });

    return { success: true };
  }

  private async processModel(
    delegate: any,
    idField: string,
    changes: any,
    customCreate?: (item: any) => Promise<void>,
  ) {
    for (const item of changes.created) {
      if (customCreate) {
        await customCreate(item);
      } else {
        await delegate.create({ data: item });
      }
    }

    for (const item of changes.updated) {
      const id = item[idField];
      const existing = await delegate.findUnique({ where: { [idField]: id } });
      const itemDate = item.updated_at ? new Date(item.updated_at) : new Date();

      if (existing && (!existing.updated_at || itemDate > existing.updated_at)) {
        await delegate.update({ where: { [idField]: id }, data: item });
      }
    }

    for (const id of changes.deleted) {
      await delegate.update({ where: { [idField]: id }, data: { deleted_at: new Date() } });
    }
  }

  async pull(userId: number, lastPulledAt: number) {
    const lastSyncDate = new Date(lastPulledAt);

    const userTrips = await this.prisma.trip_Members.findMany({
      where: { user_id: userId },
      select: { trip_id: true },
    });
    const tripIds = userTrips.map((t) => t.trip_id);

    const trips = await this.prisma.trip.findMany({
      where: { trip_id: { in: tripIds }, updated_at: { gt: lastSyncDate } },
    });

    const destinations = await this.prisma.destination.findMany({
      where: { trip_id: { in: tripIds }, updated_at: { gt: lastSyncDate } },
    });

    const locations = await this.prisma.location.findMany({
      where: { trip_id: { in: tripIds }, updated_at: { gt: lastSyncDate } },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { trip_id: { in: tripIds }, updated_at: { gt: lastSyncDate } },
    });

    const formatChanges = (data: any[], idField: string) => ({
      created: [],
      updated: data.filter((item) => !item.deleted_at),
      deleted: data.filter((item) => item.deleted_at).map((item) => item[idField]),
    });

    return {
      changes: {
        trips: formatChanges(trips, 'trip_id'),
        destinations: formatChanges(destinations, 'destination_id'),
        locations: formatChanges(locations, 'location_id'),
        expenses: formatChanges(expenses, 'expense_id'),
      },
      timestamp: Date.now(),
    };
  }
}