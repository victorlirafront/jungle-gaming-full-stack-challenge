import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [ScheduleModule.forRoot(), TasksModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}

