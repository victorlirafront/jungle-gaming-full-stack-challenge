import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsGateway } from './controllers/notifications.gateway';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [
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
  providers: [NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}

