import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService, CreateNotificationDto } from './notifications.service';

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

  constructor(private notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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

    console.log(`User ${userId} authenticated with socket ${client.id}`);

    return { success: true };
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @MessageBody() data: { userId: string; limit?: number },
    @ConnectedSocket() _client: Socket,
  ) {
    const notifications = await this.notificationsService.findAllByUser(
      data.userId,
      data.limit,
    );
    return notifications;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string; userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    await this.notificationsService.markAsRead(
      data.notificationId,
      data.userId,
    );
    return { success: true };
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    await this.notificationsService.markAllAsRead(data.userId);
    return { success: true };
  }

  async sendNotificationToUser(
    userId: string,
    notification: CreateNotificationDto,
  ) {
    const savedNotification = await this.notificationsService.create(notification);

    this.server.to(`user:${userId}`).emit('notification', savedNotification);

    return savedNotification;
  }

  async broadcastToUsers(
    userIds: string[],
    notification: Omit<CreateNotificationDto, 'userId'>,
  ) {
    const promises = userIds.map((userId) =>
      this.sendNotificationToUser(userId, { ...notification, userId }),
    );
    return Promise.all(promises);
  }
}

