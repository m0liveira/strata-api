import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    // #TODO - Update this to include direct associated user data (eg. Trips, Friends & Follows)
    async getUserData(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                username: true,
                email: true,
                name: true,
                photo: true,
            },
        });

        if (!user) throw new NotFoundException('User not found!');
        return user;
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
