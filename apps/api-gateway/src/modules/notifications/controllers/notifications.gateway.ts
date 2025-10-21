import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { firstValueFrom } from 'rxjs';
import { JwtPayload } from '../../../common';

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

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
  async handleAuthenticate(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(data.token);
      const userId = payload.sub;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} authenticated with socket ${client.id}`);

      return { success: true, userId };
    } catch (error) {
      this.logger.error(`Authentication failed for socket ${client.id}`, error);
      throw new UnauthorizedException('Invalid token');
    }
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

