import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';

@Controller()
export class NotificationsController {
  constructor(private notificationsGateway: NotificationsGateway) {}

  @MessagePattern('notifications.broadcast')
  async handleBroadcastNotification(@Payload() data: any) {
    const { userId, notification } = data;
    await this.notificationsGateway.sendNotificationToUser(userId, notification);
    return { success: true };
  }
}

