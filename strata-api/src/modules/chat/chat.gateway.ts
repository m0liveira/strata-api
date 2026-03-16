/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('joinTrip')
    async handleJoinTrip(@MessageBody() data: { tripId: string }, @ConnectedSocket() client: Socket) {
        await client.join(data.tripId);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { tripId: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        const userId = client.data.user?.sub || client.data.user?.id || client.data.user?.userId;

        if (!userId) return;

        try {
            const savedMessage = await this.chatService.saveMessage(data.tripId, userId, data.message);
            this.server.to(data.tripId).emit('newMessage', savedMessage);
        } catch (error) {
            throw new WsException('Failed to send message: ' + error.message);
        }
    }
}