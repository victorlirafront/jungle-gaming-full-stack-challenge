import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from './config';
import { RpcExceptionFilter, APP_CONSTANTS } from './common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || APP_CONSTANTS.RABBITMQ.DEFAULT_URL],
      queue: APP_CONSTANTS.RABBITMQ.QUEUES.GATEWAY,
      queueOptions: {
        durable: true,
      },
    },
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new RpcExceptionFilter());

  app.enableCors(configService.corsConfig);

  const swaggerConfig = configService.swaggerConfig;
  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConfig.path, app, document);

  await app.startAllMicroservices();

  const { port } = configService.appConfig;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API Gateway running on http://0.0.0.0:${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/${swaggerConfig.path}`);
}

bootstrap();

