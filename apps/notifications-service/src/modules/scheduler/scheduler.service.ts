import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/services/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanOldNotifications() {
    this.logger.log('Starting cleanup of old notifications...');

    try {
      await this.notificationsService.cleanOldNotifications();
      this.logger.log('Successfully cleaned old notifications');
    } catch (error) {
      this.logger.error('Failed to clean old notifications', error);
    }
  }
}

