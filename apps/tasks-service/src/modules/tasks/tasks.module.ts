import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { Task, Comment, TaskAssignment, TaskHistory } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, TaskAssignment, TaskHistory]),
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

