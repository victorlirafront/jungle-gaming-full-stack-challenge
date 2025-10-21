import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { RpcExceptionFilter } from './common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new RpcExceptionFilter());

  const { url, queue } = configService.rabbitMQConfig;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const { port } = configService.appConfig;
  await app.listen(port, '0.0.0.0');

  logger.log(`🔐 Auth Service running on http://0.0.0.0:${port}`);
}

bootstrap();

