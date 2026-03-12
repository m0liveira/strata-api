import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
    constructor(private prisma: PrismaService) { }

    async follow(requesterId: number, receiverId: number) {
        if (requesterId === receiverId)
            throw new BadRequestException('You cannot follow yourself');

        const receiverExists = await this.prisma.user.findUnique({ where: { user_id: receiverId } });
        const requesterExists = await this.prisma.user.findUnique({ where: { user_id: requesterId } });

        if (!receiverExists || !requesterExists)
            throw new NotFoundException('User not found');

        const existing = await this.prisma.follows.findFirst({
            where: { requester_id: requesterId, receiver_id: receiverId },
        });

        if (existing)
            throw new ConflictException('You are already following this user');

        return this.prisma.follows.create({
            data: {
                requester_id: requesterId,
                receiver_id: receiverId,
                status: 'ACCEPTED',
            },
        });
    }

    async unfollow(requesterId: number, receiverId: number) {
        const deleted = await this.prisma.follows.deleteMany({
            where: {
                requester_id: requesterId,
                receiver_id: receiverId,
            },
        });

        if (deleted.count === 0)
            throw new NotFoundException('Follow relationship not found');

        return { code: 200, message: 'Unfollowed successfully' };
    }

    async getFollowers(userId: number) {
        return this.prisma.follows.findMany({
            where: { receiver_id: userId },
        });
    }

    async getFollowing(userId: number) {
        return this.prisma.follows.findMany({
            where: { requester_id: userId },
        });
    }
}