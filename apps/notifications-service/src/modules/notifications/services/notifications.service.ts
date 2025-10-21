import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Notification, NotificationType } from '../../../entities/notification.entity';
import { NOTIFICATIONS_CONSTANTS } from '../../../common';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    await this.checkSpamProtection(dto.userId);

    const notification = this.notificationRepository.create(dto);
    const saved = await this.notificationRepository.save(notification);
    
    this.logger.log(`📬 Notification created for user ${dto.userId}: ${dto.type}`);
    
    return saved;
  }

  private async checkSpamProtection(userId: string): Promise<void> {
    const oneMinuteAgo = new Date(Date.now() - NOTIFICATIONS_CONSTANTS.RATE_LIMIT.CREATE.TTL);
    
    const recentCount = await this.notificationRepository.count({
      where: {
        userId,
        createdAt: MoreThan(oneMinuteAgo),
      },
    });

    if (recentCount >= NOTIFICATIONS_CONSTANTS.RATE_LIMIT.CREATE.LIMIT) {
      this.logger.warn(`⚠️  Spam protection triggered for user ${userId}: ${recentCount} notifications in last minute`);
      throw new BadRequestException('Too many notifications created. Please try again later.');
    }
  }

  async findAllByUser(userId: string, limit?: number): Promise<Notification[]> {
    const actualLimit = limit ?? NOTIFICATIONS_CONSTANTS.DEFAULT_LIMIT;
    const maxLimit = Math.min(actualLimit, NOTIFICATIONS_CONSTANTS.MAX_LIMIT);

    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: maxLimit,
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found or does not belong to user');
    }

    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  async cleanOldNotifications(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - NOTIFICATIONS_CONSTANTS.RETENTION_DAYS);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`🧹 Cleaned ${result.affected} old notifications (older than ${NOTIFICATIONS_CONSTANTS.RETENTION_DAYS} days)`);
    }
  }
}

