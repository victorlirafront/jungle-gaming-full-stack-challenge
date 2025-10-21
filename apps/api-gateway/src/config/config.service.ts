import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get appConfig() {
    return {
      port: parseInt(process.env.PORT || '3001'),
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  get corsConfig() {
    const isDevelopment = this.appConfig.isDevelopment;
    const corsOrigin = process.env.CORS_ORIGIN;

    let origin: string | string[] | boolean;

    if (corsOrigin) {
      origin = corsOrigin.includes(',') 
        ? corsOrigin.split(',').map(o => o.trim())
        : corsOrigin;
    } else if (isDevelopment) {
      origin = ['http://localhost:3000', 'http://localhost:5173'];
    } else {
      origin = false;
    }

    return {
      origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  get rabbitMQConfig() {
    return {
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672',
      authQueue: 'auth_queue',
      tasksQueue: 'tasks_queue',
    };
  }

  get throttlerConfig() {
    return {
      ttl: parseInt(process.env.THROTTLE_TTL || '1000'),
      limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
    };
  }

  get jwtConfig() {
    return {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    };
  }

  get swaggerConfig() {
    return {
      title: 'Task Management API',
      description: 'API Gateway for Task Management System',
      version: '1.0',
      path: 'api/docs',
    };
  }
}

