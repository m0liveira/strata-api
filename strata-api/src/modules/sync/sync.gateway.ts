import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  notifySyncNeeded(tripId: string) {
    this.server.to(tripId).emit('syncNeeded', { tripId });
  }
}