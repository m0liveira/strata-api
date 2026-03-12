import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendshipService {
    constructor(private prisma: PrismaService) { }

    async getAll(userId: number) {
        return this.prisma.friendship.findMany({
            where: {
                OR: [
                    { requester_id: userId },
                    { receiver_id: userId },
                ],
            },
        });
    }

    async getAccepted(userId: number) {
        return this.prisma.friendship.findMany({
            where: {
                OR: [
                    { requester_id: userId },
                    { receiver_id: userId },
                ],
                status: 'ACCEPTED',
            },
        });
    }

    async getPending(userId: number) {
        return this.prisma.friendship.findMany({
            where: {
                OR: [
                    { requester_id: userId },
                    { receiver_id: userId },
                ],
                status: 'PENDING',
            },
        });
    }

    async sendRequest(requesterId: number, receiverId: number) {
        if (requesterId === receiverId)
            throw new BadRequestException('You cannot send a friend request to yourself');

        const receiverExists = await this.prisma.user.findUnique({ where: { user_id: receiverId } });
        const requesterExists = await this.prisma.user.findUnique({ where: { user_id: requesterId } });

        if (!receiverExists)
            throw new NotFoundException('User not found');

        if (!requesterExists)
            throw new NotFoundException('Requester not found');

        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { requester_id: requesterId, receiver_id: receiverId },
                    { requester_id: receiverId, receiver_id: requesterId },
                ],
            },
        });

        if (existing)
            throw new ConflictException('Friendship or pending request already exists');


        return this.prisma.friendship.create({
            data: {
                requester_id: requesterId,
                receiver_id: receiverId,
                status: 'PENDING',
            },
        });
    }

    async acceptRequest(receiverId: number, requesterId: number) {
        const request = await this.prisma.friendship.findFirst({
            where: {
                requester_id: requesterId,
                receiver_id: receiverId,
                status: 'PENDING',
            },
        });

        if (!request)
            throw new NotFoundException('Pending friend request not found');

        return this.prisma.friendship.updateMany({
            where: {
                requester_id: requesterId,
                receiver_id: receiverId,
            },
            data: { status: 'ACCEPTED' },
        });
    }

    async removeFriendship(userId: number, otherUserId: number) {
        const deleted = await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    { requester_id: userId, receiver_id: otherUserId },
                    { requester_id: otherUserId, receiver_id: userId },
                ],
            },
        });

        if (deleted.count === 0)
            throw new NotFoundException('Friendship not found');

        return { code: 200, message: 'Friendship removed' };
    }
}