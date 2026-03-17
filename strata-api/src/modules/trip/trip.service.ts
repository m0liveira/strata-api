import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripService {
    constructor(private prisma: PrismaService) { }

    async getTripById(tripId: string, userId: number) {
        const trip = await this.prisma.trip.findFirst({
            where: {
                trip_id: tripId,
                deleted_at: null,
                members: { some: { user_id: userId, status: 'ACCEPTED' } },
            },
            include: {
                locations: { where: { trip_id: tripId, deleted_at: null } },
                destinations: { where: { trip_id: tripId, deleted_at: null } },
                members: {
                    where: { trip_id: tripId, status: 'ACCEPTED' },
                    include: { user: { select: { user_id: true, name: true, photo: true, username: true, email: true } } }
                },
                chats: { where: { trip_id: tripId, deleted_at: null } },
                expenses: { where: { trip_id: tripId, user_id: userId, deleted_at: null } },
            },
        });

        if (!trip)
            throw new NotFoundException('Trip not found or you do not have access to it!');

        return trip;
    }

    async getPublicTrips() {
        const trips = await this.prisma.trip.findMany({
            where: { visibility: 'PUBLIC', deleted_at: null }
        })

        if (!trips || trips.length === 0)
            throw new NotFoundException('No public trips found!');

        return trips;
    }

    async getFriendSharedTrips(userId: number) {
        const following = await this.prisma.follows.findMany({
            where: { requester_id: userId },
            select: { receiver_id: true },
        });

        const friends = await this.prisma.friendship.findMany({
            where: {
                OR: [{ requester_id: userId }, { receiver_id: userId }],
                status: 'ACCEPTED'
            },
            select: { requester_id: true, receiver_id: true },
        });

        const followingIds = following.map((f) => f.receiver_id);
        const friendIds = friends.map((f) => f.requester_id === userId ? f.receiver_id : f.requester_id);

        const socialIds = [...new Set([...followingIds, ...friendIds])];

        if (socialIds.length === 0)
            throw new NotFoundException('No friends or following found!');

        const trips = await this.prisma.trip.findMany({
            where: {
                visibility: 'PUBLIC',
                deleted_at: null,
                members: {
                    some: {
                        user_id: { in: socialIds },
                        status: 'ACCEPTED',
                    },
                },
            }
        });

        if (!trips || trips.length === 0)
            throw new NotFoundException('No trips from friends or following found!');

        return trips;
    }

    async getSharedTripsById(tripId: string) {
        const trip = await this.prisma.trip.findFirst({
            where: {
                trip_id: tripId,
                deleted_at: null,
            },
            include: {
                locations: { where: { trip_id: tripId, deleted_at: null } },
                destinations: { where: { trip_id: tripId, deleted_at: null } }
            },
        });

        if (!trip)
            throw new NotFoundException('Trip not found!');

        return trip;
    }
}
