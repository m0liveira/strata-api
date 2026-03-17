import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripMembersService {
    constructor(private prisma: PrismaService) { }

    async inviteUser(tripId: string, inviterId: number, targetUserId: number) {
        const inviter = await this.prisma.trip_Members.findFirst({
            where: { trip_id: tripId, user_id: inviterId, status: 'ACCEPTED' },
        });

        if (!inviter)
            throw new ForbiddenException('You must be an accepted member of this trip to invite others');

        const targetUser = await this.prisma.user.findUnique({ where: { user_id: targetUserId } });

        if (!targetUser)
            throw new NotFoundException('User not found');

        const existing = await this.prisma.trip_Members.findFirst({
            where: { trip_id: tripId, user_id: targetUserId },
        });

        if (existing)
            throw new ConflictException('User is already invited or in the trip');

        return this.prisma.trip_Members.create({
            data: {
                trip_id: tripId,
                user_id: targetUserId,
                status: 'PENDING',
            },
        });
    }

    async acceptInvite(tripId: string, userId: number) {
        const invite = await this.prisma.trip_Members.findFirst({
            where: { trip_id: tripId, user_id: userId, status: 'PENDING' },
        });

        if (!invite)
            throw new NotFoundException('Pending invite not found');

        return this.prisma.trip_Members.update({
            where: { trip_members_id: invite.trip_members_id },
            data: { status: 'ACCEPTED' },
        });
    }

    async removeMemberOrDecline(tripId: string, userId: number) {
        const member = await this.prisma.trip_Members.findFirst({
            where: { trip_id: tripId, user_id: userId },
        });

        if (!member)
            throw new NotFoundException('Membership or invite not found');

        await this.prisma.trip_Members.delete({
            where: { trip_members_id: member.trip_members_id },
        });

        return { code: 200, message: 'Removed successfully' };
    }

    async getTripMembers(tripId: string, userId: number) {
        const hasAccess = await this.prisma.trip_Members.findFirst({
            where: { trip_id: tripId, user_id: userId, status: 'ACCEPTED' },
        });

        if (!hasAccess)
            throw new NotFoundException('Trip not found or you do not have access to it');

        const members = await this.prisma.trip_Members.findMany({
            where: { trip_id: tripId, status: 'ACCEPTED' },
            include: { user: { select: { user_id: true, name: true, photo: true, username: true, email: true } } },
        });

        return members;
    }
}