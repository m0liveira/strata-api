import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto } from './dto/sync.dto';

@Injectable()
export class SyncService {
    constructor(private prisma: PrismaService) { }

    async push(userId: number, data: SyncPushDto) {
        const { changes } = data;

        await this.prisma.$transaction(async (tx) => {
            // Trips
            if (changes.trips) {
                for (const item of changes.trips.created) {
                    await tx.trip.create({
                        data: {
                            ...item,
                            members: {
                                create: {
                                    user_id: userId,
                                    status: 'ACCEPTED',
                                },
                            },
                        },
                    });
                }
                
                for (const item of changes.trips.updated) {
                    const existing = await tx.trip.findUnique({ where: { trip_id: item.trip_id } });
                    const itemDate = item.updated_at ? new Date(item.updated_at) : new Date();

                    if (existing && (!existing.updated_at || itemDate > existing.updated_at)) {
                        await tx.trip.update({ where: { trip_id: item.trip_id }, data: item });
                    }
                }
                for (const id of changes.trips.deleted) {
                    await tx.trip.update({ where: { trip_id: id }, data: { deleted_at: new Date() } });
                }
            }

            // Destinations
            if (changes.destinations) {
                for (const item of changes.destinations.created) await tx.destination.create({ data: item });

                for (const item of changes.destinations.updated) {
                    const existing = await tx.destination.findUnique({ where: { destination_id: item.destination_id } });
                    const itemDate = item.updated_at ? new Date(item.updated_at) : new Date();

                    if (existing && (!existing.updated_at || itemDate > existing.updated_at)) {
                        await tx.destination.update({ where: { destination_id: item.destination_id }, data: item });
                    }
                }
                for (const id of changes.destinations.deleted) {
                    await tx.destination.update({ where: { destination_id: id }, data: { deleted_at: new Date() } });
                }
            }

            // Locations
            if (changes.locations) {
                for (const item of changes.locations.created) await tx.location.create({ data: item });
                for (const item of changes.locations.updated) {
                    const existing = await tx.location.findUnique({ where: { location_id: item.location_id } });
                    const itemDate = item.updated_at ? new Date(item.updated_at) : new Date();

                    if (existing && (!existing.updated_at || itemDate > existing.updated_at)) {
                        await tx.location.update({ where: { location_id: item.location_id }, data: item });
                    }
                }
                for (const id of changes.locations.deleted) {
                    await tx.location.update({ where: { location_id: id }, data: { deleted_at: new Date() } });
                }
            }

            // Expenses
            if (changes.expenses) {
                for (const item of changes.expenses.created) await tx.expense.create({ data: item });
                for (const item of changes.expenses.updated) {
                    const existing = await tx.expense.findUnique({ where: { expense_id: item.expense_id } });
                    const itemDate = item.updated_at ? new Date(item.updated_at) : new Date();

                    if (existing && (!existing.updated_at || itemDate > existing.updated_at)) {
                        await tx.expense.update({ where: { expense_id: item.expense_id }, data: item });
                    }
                }
                for (const id of changes.expenses.deleted) {
                    await tx.expense.update({ where: { expense_id: id }, data: { deleted_at: new Date() } });
                }
            }
        });

        return { success: true };
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

        return {
            changes: {
                trips: {
                    created: [],
                    updated: trips.filter((t) => !t.deleted_at),
                    deleted: trips.filter((t) => t.deleted_at).map((t) => t.trip_id),
                },
                destinations: {
                    created: [],
                    updated: destinations.filter((d) => !d.deleted_at),
                    deleted: destinations.filter((d) => d.deleted_at).map((d) => d.destination_id),
                },
                locations: {
                    created: [],
                    updated: locations.filter((l) => !l.deleted_at),
                    deleted: locations.filter((l) => l.deleted_at).map((l) => l.location_id),
                },
                expenses: {
                    created: [],
                    updated: expenses.filter((e) => !e.deleted_at),
                    deleted: expenses.filter((e) => e.deleted_at).map((e) => e.expense_id),
                },
            },
            timestamp: Date.now(),
        };
    }
}