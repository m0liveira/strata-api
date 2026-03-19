import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

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

    async generateTripPdf(tripId: string): Promise<PDFKit.PDFDocument> {
        const trip = await this.prisma.trip.findUnique({
            where: { trip_id: tripId },
            include: {
                destinations: true,
                locations: {
                    orderBy: [
                        { day: 'asc' },
                        { scheduled_time: 'asc' }
                    ]
                }
            },
        });

        if (!trip)
            throw new NotFoundException('Trip not found!');

        if (!trip.locations || trip.locations.length === 0)
            throw new NotFoundException('Add at least one location to generate the PDF!');

        const doc = new PDFDocument();

        doc.fontSize(24).text(trip.name, { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Style: ${trip.travel_style}`);
        doc.text(`Budget: ${trip.budget_level}`);
        doc.text(`Visibility: ${trip.visibility}`);
        doc.moveDown();

        if (trip.destinations.length > 0) {
            const tags = trip.destinations.map(d => d.destination).join(', ');
            doc.fontSize(12).text(`Countries/Cities to Visit: ${tags}`);
            doc.moveDown();
        }

        doc.fontSize(18).text('Itinerary', { underline: true });
        doc.moveDown(0.5);

        let currentDay = -1;

        trip.locations.forEach(loc => {
            if (loc.day !== currentDay) {
                doc.moveDown(0.5);
                doc.fontSize(14).text(`Day ${loc.day}`, { underline: true });
                doc.moveDown(0.3);
                currentDay = loc.day;
            }

            let timeString = 'Time to define';

            if (loc.scheduled_time) {
                const date = new Date(loc.scheduled_time);
                timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }

            doc.fontSize(12).fillColor('black').text(`• ${timeString} - ${loc.name}`);

            if (loc.ticket_url) {
                doc.fontSize(10).fillColor('blue').text('   Ticket Link', { link: loc.ticket_url });
            }
        });

        doc.end();

        return doc;
    }
}
