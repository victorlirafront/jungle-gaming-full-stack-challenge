import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  handleConnection(client: Socket) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client disconnected: ${client.id}`);
    }
    this.userSockets.forEach((sockets, userId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    });
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);

    if (process.env.NODE_ENV === 'development') {
      console.log(`User ${userId} authenticated with socket ${client.id}`);
    }

    return { success: true };
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @MessageBody() data: { userId: string; limit?: number },
    @ConnectedSocket() _client: Socket,
  ) {
    const notifications = await firstValueFrom(
      this.notificationsClient.send('notifications.findAll', data),
    );
    return notifications;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string; userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    await firstValueFrom(
      this.notificationsClient.send('notifications.markAsRead', data),
    );
    return { success: true };
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    await firstValueFrom(
      this.notificationsClient.send('notifications.markAllAsRead', data),
    );
    return { success: true };
  }

  async sendNotificationToUser(
    userId: string,
    notification: Record<string, unknown>
  ) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}

