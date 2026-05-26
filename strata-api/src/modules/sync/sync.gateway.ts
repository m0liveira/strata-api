import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTrip')
  handleJoinTrip(@ConnectedSocket() client: Socket, @MessageBody() data: { tripId: string }) {
    console.log(`[SOCKET] App joined: ${data.tripId}`);
    client.join(data.tripId);
  }

  notifySyncNeeded(tripId: string) {
    console.log(`[SOCKET] Notifying sync needed for trip: ${tripId}`);
    this.server.to(tripId).emit('syncNeeded', { tripId });
  }
}