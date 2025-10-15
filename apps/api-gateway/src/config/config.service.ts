import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  // Application Configuration
  get appConfig() {
    return {
      port: parseInt(process.env.PORT || '3001'),
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  // CORS Configuration
  get corsConfig() {
    return {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    };
  }

  // RabbitMQ Configuration
  get rabbitMQConfig() {
    return {
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672',
      authQueue: 'auth_queue',
    };
  }

  // Throttler Configuration
  get throttlerConfig() {
    return {
      ttl: parseInt(process.env.THROTTLE_TTL || '1000'),
      limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
    };
  }

  // Swagger Configuration
  get swaggerConfig() {
    return {
      title: 'Task Management API',
      description: 'API Gateway for Task Management System',
      version: '1.0',
      path: 'api/docs',
    };
  }
}

