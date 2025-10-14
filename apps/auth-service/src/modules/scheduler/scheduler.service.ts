import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanExpiredTokens() {
    this.logger.log('Starting cleanup of expired refresh tokens...');

    try {
      await this.authService.cleanExpiredTokens();
      this.logger.log('Successfully cleaned expired refresh tokens');
    } catch (error) {
      this.logger.error('Failed to clean expired tokens', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCleanup() {
    this.logger.debug('Performing hourly token cleanup...');

    try {
      await this.authService.cleanExpiredTokens();
    } catch (error) {
      this.logger.error('Hourly cleanup failed', error);
    }
  }
}

