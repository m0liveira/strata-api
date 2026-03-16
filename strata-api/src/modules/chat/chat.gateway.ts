/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

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
    const userId = client.data.user.userId;
    const savedMessage = await this.chatService.saveMessage(data.tripId, userId, data.message);
    
    this.server.to(data.tripId).emit('newMessage', savedMessage);
  }
}