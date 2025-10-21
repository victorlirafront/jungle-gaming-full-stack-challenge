import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from '../tasks/services/tasks.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly tasksService: TasksService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanOldHistory() {
    this.logger.log('Starting cleanup of old task history...');

    try {
      await this.tasksService.cleanOldHistory();
      this.logger.log('Successfully cleaned old task history');
    } catch (error) {
      this.logger.error('Failed to clean old task history', error);
    }
  }
}

