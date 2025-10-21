import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { getDatabaseSynchronizeOption } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'challenge_db',
      autoLoadEntities: true,
      synchronize: getDatabaseSynchronizeOption(),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    NotificationsModule,
    HealthModule,
    SchedulerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

