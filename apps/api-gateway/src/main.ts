import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from './config';
import { RpcExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'gateway_queue',
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

  console.log(`🚀 API Gateway running on http://0.0.0.0:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/${swaggerConfig.path}`);
}

bootstrap();

