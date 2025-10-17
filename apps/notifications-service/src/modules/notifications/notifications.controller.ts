import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Controller()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    @Inject('GATEWAY_SERVICE')
    private gatewayClient: ClientProxy,
  ) {}

  @MessagePattern('task.created')
  async handleTaskCreated(@Payload() data: any) {
    const { taskId, title, creatorId, assignedUserIds } = data;

    if (assignedUserIds && assignedUserIds.length > 0) {
      for (const userId of assignedUserIds) {
        const notification = await this.notificationsService.create({
          userId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Nova tarefa atribuída',
          message: `Você foi atribuído à tarefa: ${title}`,
          data: { taskId, creatorId },
        });

        this.gatewayClient.emit('notifications.broadcast', {
          userId,
          notification,
        });
      }
    }

    return { success: true };
  }

  @MessagePattern('task.status_changed')
  async handleTaskStatusChanged(@Payload() data: any) {
    const { taskId, title, oldStatus, newStatus, userId } = data;

    const notification = await this.notificationsService.create({
      userId,
      type: NotificationType.TASK_STATUS_CHANGED,
      title: 'Status da tarefa alterado',
      message: `A tarefa "${title}" mudou de ${oldStatus} para ${newStatus}`,
      data: { taskId, oldStatus, newStatus },
    });

    this.gatewayClient.emit('notifications.broadcast', {
      userId,
      notification,
    });

    return { success: true };
  }

  @MessagePattern('task.commented')
  async handleTaskCommented(@Payload() data: any) {
    const { taskId, commentId, authorId, assignedUserIds, creatorId } = data;

    const usersToNotify = new Set<string>();
    
    if (creatorId && creatorId !== authorId) {
      usersToNotify.add(creatorId);
    }
    
    if (assignedUserIds && assignedUserIds.length > 0) {
      assignedUserIds.forEach((userId: string) => {
        if (userId !== authorId) {
          usersToNotify.add(userId);
        }
      });
    }

    if (usersToNotify.size > 0) {
      for (const userId of Array.from(usersToNotify)) {
        const notification = await this.notificationsService.create({
          userId,
          type: NotificationType.TASK_COMMENTED,
          title: 'Novo comentário',
          message: 'Um novo comentário foi adicionado à tarefa',
          data: { taskId, commentId, authorId },
        });

        this.gatewayClient.emit('notifications.broadcast', {
          userId,
          notification,
        });
      }
    }

    return { success: true };
  }

  @MessagePattern('task.deleted')
  async handleTaskDeleted(@Payload() data: any) {
    const { taskId, title, userId } = data;

    const notification = await this.notificationsService.create({
      userId,
      type: NotificationType.TASK_DELETED,
      title: 'Tarefa deletada',
      message: `A tarefa "${title}" foi deletada`,
      data: { taskId },
    });

    this.gatewayClient.emit('notifications.broadcast', {
      userId,
      notification,
    });

    return { success: true };
  }

  @MessagePattern('notifications.findAll')
  async findAll(@Payload() data: { userId: string; limit?: number }) {
    return this.notificationsService.findAllByUser(data.userId, data.limit);
  }

  @MessagePattern('notifications.markAsRead')
  async markAsRead(
    @Payload() data: { notificationId: string; userId: string },
  ) {
    await this.notificationsService.markAsRead(
      data.notificationId,
      data.userId,
    );
    return { success: true };
  }

  @MessagePattern('notifications.markAllAsRead')
  async markAllAsRead(@Payload() data: { userId: string }) {
    await this.notificationsService.markAllAsRead(data.userId);
    return { success: true };
  }
}

