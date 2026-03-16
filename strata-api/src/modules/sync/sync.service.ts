/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto } from './dto/sync.dto';

@Injectable()
export class SyncService {
    constructor(private prisma: PrismaService) { }

    async push(userId: number, data: SyncPushDto) {
        const { changes } = data;

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