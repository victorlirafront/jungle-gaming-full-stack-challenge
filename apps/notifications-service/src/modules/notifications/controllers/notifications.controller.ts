import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { NotificationsService } from '../services/notifications.service';
import { NotificationType } from '../../../entities/notification.entity';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskStatusChangedEvent,
  TaskCommentedEvent,
  TaskDeletedEvent,
} from '../interfaces/task-events.interface';

@Controller()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    @Inject('GATEWAY_SERVICE')
    private gatewayClient: ClientProxy,
  ) {}

  private getAssignedUsersToNotify(
    assignedUserIds: string[] | undefined,
    excludeUserIds: string[]
  ): string[] {
    if (!assignedUserIds || assignedUserIds.length === 0) {
      return [];
    }

    const usersToNotify = new Set<string>();
    assignedUserIds.forEach((userId: string) => {
      if (!excludeUserIds.includes(userId)) {
        usersToNotify.add(userId);
      }
    });

    return Array.from(usersToNotify);
  }

  private async notifyUsers(
    userIds: string[],
    notificationType: NotificationType,
    title: string,
    message: string,
    data: Record<string, unknown>
  ): Promise<void> {
    for (const userId of userIds) {
      const notification = await this.notificationsService.create({
        userId,
        type: notificationType,
        title,
        message,
        data,
      });

      this.gatewayClient.emit('notifications.broadcast', {
        userId,
        notification,
      });
    }
  }

  @MessagePattern('task.created')
  async handleTaskCreated(@Payload() data: TaskCreatedEvent) {
    const { taskId, title, creatorId, assignedUserIds } = data;

    const usersToNotify = this.getAssignedUsersToNotify(assignedUserIds, [creatorId]);

    if (usersToNotify.length > 0) {
      await this.notifyUsers(
        usersToNotify,
        NotificationType.TASK_ASSIGNED,
        'Nova tarefa atribuída',
        `Você foi atribuído à tarefa: ${title}`,
        { taskId, creatorId }
      );
    }

    return { success: true };
  }

  @MessagePattern('task.assigned')
  async handleTaskAssigned(@Payload() data: TaskCreatedEvent) {
    return this.handleTaskCreated(data);
  }

  @MessagePattern('task.updated')
  async handleTaskUpdated(@Payload() data: TaskUpdatedEvent) {
    const { taskId, title, changes, userId, assignedUserIds, creatorId, newlyAssignedUserIds } = data;

    const excludeUserIds = [userId, creatorId, ...(newlyAssignedUserIds || [])];
    const usersToNotify = this.getAssignedUsersToNotify(assignedUserIds, excludeUserIds);

    if (usersToNotify.length > 0) {
      await this.notifyUsers(
        usersToNotify,
        NotificationType.TASK_UPDATED,
        'Tarefa atualizada',
        `A tarefa "${title}" foi atualizada`,
        { taskId, changes }
      );
    }

    return { success: true };
  }

  @MessagePattern('task.status_changed')
  async handleTaskStatusChanged(@Payload() data: TaskStatusChangedEvent) {
    const { taskId, title, oldStatus, newStatus, userId, assignedUserIds, creatorId } = data;

    const usersToNotify = this.getAssignedUsersToNotify(assignedUserIds, [userId, creatorId]);

    if (usersToNotify.length > 0) {
      await this.notifyUsers(
        usersToNotify,
        NotificationType.TASK_STATUS_CHANGED,
        'Status da tarefa alterado',
        `A tarefa "${title}" mudou de ${oldStatus} para ${newStatus}`,
        { taskId, oldStatus, newStatus }
      );
    }

    return { success: true };
  }

  @MessagePattern('task.commented')
  async handleTaskCommented(@Payload() data: TaskCommentedEvent) {
    const { taskId, commentId, authorId, assignedUserIds, creatorId } = data;

    const usersToNotify = new Set<string>();

    if (creatorId && creatorId !== authorId) {
      usersToNotify.add(creatorId);
    }

    const assignedToNotify = this.getAssignedUsersToNotify(assignedUserIds, [authorId]);
    assignedToNotify.forEach(userId => usersToNotify.add(userId));

    if (usersToNotify.size > 0) {
      await this.notifyUsers(
        Array.from(usersToNotify),
        NotificationType.TASK_COMMENTED,
        'Novo comentário',
        'Um novo comentário foi adicionado à tarefa',
        { taskId, commentId, authorId }
      );
    }

    return { success: true };
  }

  @MessagePattern('task.deleted')
  async handleTaskDeleted() {
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

