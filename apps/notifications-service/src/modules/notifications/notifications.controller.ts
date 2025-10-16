import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '../../entities/notification.entity';

@Controller()
export class NotificationsController {
  constructor(private notificationsGateway: NotificationsGateway) {}

  @MessagePattern('task.created')
  async handleTaskCreated(@Payload() data: any) {
    const { taskId, title, creatorId, assignedUserIds } = data;

    if (assignedUserIds && assignedUserIds.length > 0) {
      await this.notificationsGateway.broadcastToUsers(
        assignedUserIds,
        {
          type: NotificationType.TASK_ASSIGNED,
          title: 'Nova tarefa atribuída',
          message: `Você foi atribuído à tarefa: ${title}`,
          data: { taskId, creatorId },
        },
      );
    }

    return { success: true };
  }

  @MessagePattern('task.status_changed')
  async handleTaskStatusChanged(@Payload() data: any) {
    const { taskId, title, oldStatus, newStatus, userId } = data;

    await this.notificationsGateway.sendNotificationToUser(userId, {
      userId,
      type: NotificationType.TASK_STATUS_CHANGED,
      title: 'Status da tarefa alterado',
      message: `A tarefa "${title}" mudou de ${oldStatus} para ${newStatus}`,
      data: { taskId, oldStatus, newStatus },
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
      await this.notificationsGateway.broadcastToUsers(
        Array.from(usersToNotify),
        {
          type: NotificationType.TASK_COMMENTED,
          title: 'Novo comentário',
          message: 'Um novo comentário foi adicionado à tarefa',
          data: { taskId, commentId, authorId },
        },
      );
    }

    return { success: true };
  }

  @MessagePattern('task.deleted')
  async handleTaskDeleted(@Payload() data: any) {
    const { taskId, title, userId } = data;

    await this.notificationsGateway.sendNotificationToUser(userId, {
      userId,
      type: NotificationType.TASK_DELETED,
      title: 'Tarefa deletada',
      message: `A tarefa "${title}" foi deletada`,
      data: { taskId },
    });

    return { success: true };
  }
}

