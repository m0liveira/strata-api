import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponse } from './dto/user-data-response.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getUserData(userId: number): Promise<UserProfileResponse> {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                username: true,
                email: true,
                name: true,
                photo: true,
                sent_friendships: {
                    where: { deleted_at: null },
                    select: { receiver_id: true, status: true }
                },
                received_friendships: {
                    where: { deleted_at: null },
                    select: { requester_id: true, status: true }
                },
                sent_follows: {
                    where: { deleted_at: null },
                    select: { receiver_id: true }
                },
                received_follows: {
                    where: { deleted_at: null },
                    select: { requester_id: true }
                },
                trips: {
                    where: {
                        status: 'ACCEPTED',
                        trip: { deleted_at: null }
                    },
                    select: { trip: true }
                },
            }
        });

        if (!user)
            throw new NotFoundException('User not found!');

        return {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            name: user.name,
            photo: user.photo,
            pending_friends: [
                ...user.sent_friendships.filter(f => f.status === 'PENDING').map(f => f.receiver_id),
                ...user.received_friendships.filter(f => f.status === 'PENDING').map(f => f.requester_id)
            ],
            friends: [
                ...user.sent_friendships.filter(f => f.status === 'ACCEPTED').map(f => f.receiver_id),
                ...user.received_friendships.filter(f => f.status === 'ACCEPTED').map(f => f.requester_id)
            ],
            following: user.sent_follows.map(f => f.receiver_id),
            followers: user.received_follows.map(f => f.requester_id),
            trips: user.trips.map(t => t.trip)
        };
    }

    async updateProfile(userId: number, data: UpdateUserDto) {
        if (data.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: data.email },
            });

            if (emailExists && emailExists.user_id !== userId) {
                throw new ConflictException('This email is already being used');
            }
        }

        if (data.username) {
            const usernameExists = await this.prisma.user.findUnique({
                where: { username: data.username },
            });
            if (usernameExists && usernameExists.user_id !== userId) {
                throw new ConflictException('This username is already being used');
            }
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return this.prisma.user.update({
            where: { user_id: userId },
            data,
            select: {
                user_id: true,
                username: true,
                email: true,
                name: true,
                photo: true,
            },
        });
    }

    async getPublicProfile(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: {
                user_id: true,
                username: true,
                name: true,
                photo: true,
            },
        });

        if (!user) throw new NotFoundException('User not found!');
        return user;
    }
}
