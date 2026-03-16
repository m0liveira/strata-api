import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async saveMessage(tripId: string, userId: number, text: string) {
        let chat = await this.prisma.chat.findFirst({
            where: { trip_id: tripId },
        });

        if (!chat) {
            chat = await this.prisma.chat.create({
                data: { trip_id: tripId },
            });
        }

        return this.prisma.message.create({
            data: {
                user_id: userId,
                chat_id: chat.chat_id,
                message: text,
            },
            include: {
                user: { select: { name: true, photo: true } },
            },
        });
    }

    async getMessages(tripId: string) {
        const chat = await this.prisma.chat.findFirst({
            where: { trip_id: tripId },
        });

        if (!chat) return [];

        return this.prisma.message.findMany({
            where: { chat_id: chat.chat_id },
            orderBy: { created_at: 'asc' },
            include: {
                user: { select: { name: true, photo: true } },
            },
        });
    }
}