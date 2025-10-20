import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './controllers/tasks.controller';
import { ConfigService } from '../../config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TASKS_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.rabbitMQConfig.url],
            queue: configService.rabbitMQConfig.tasksQueue,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [TasksController],
})
export class TasksModule {}

