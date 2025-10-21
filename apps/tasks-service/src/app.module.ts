import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './modules/tasks/tasks.module';
import { HealthModule } from './modules/health/health.module';
import { Task, Comment, TaskAssignment, TaskHistory } from './entities';
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
      entities: [Task, Comment, TaskAssignment, TaskHistory],
      synchronize: getDatabaseSynchronizeOption(),
    }),
    TasksModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

