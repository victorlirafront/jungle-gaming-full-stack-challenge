import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsGateway } from './controllers/notifications.gateway';
import { NotificationsController } from './controllers/notifications.controller';
import { APP_CONSTANTS } from '../../common/constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || APP_CONSTANTS.RABBITMQ.DEFAULT_URL],
          queue: APP_CONSTANTS.RABBITMQ.QUEUES.NOTIFICATIONS,
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

