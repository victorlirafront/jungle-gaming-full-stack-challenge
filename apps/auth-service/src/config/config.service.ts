import { Injectable } from '@nestjs/common';
import { AUTH_CONSTANTS } from '../common';

@Injectable()
export class ConfigService {
  get dbConfig() {
    return {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'challenge_db',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    };
  }

  get jwtConfig() {
    return {
      secret: process.env.JWT_SECRET || AUTH_CONSTANTS.DEFAULT_JWT_SECRET,
      refreshSecret:
        process.env.JWT_REFRESH_SECRET ||
        AUTH_CONSTANTS.DEFAULT_JWT_REFRESH_SECRET,
      accessTokenExpiration: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION,
      refreshTokenExpiration: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRATION,
      refreshTokenExpirationDays: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRATION_DAYS,
    };
  }

  get rabbitMQConfig() {
    return {
      url: process.env.RABBITMQ_URL || AUTH_CONSTANTS.DEFAULT_RABBITMQ_URL,
      queue: AUTH_CONSTANTS.AUTH_QUEUE,
    };
  }

  get appConfig() {
    return {
      port: parseInt(process.env.PORT || '3002'),
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }
}

