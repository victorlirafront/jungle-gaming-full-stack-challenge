import { Injectable, Logger } from '@nestjs/common';
import { AUTH_CONSTANTS, APP_CONSTANTS } from '../common';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    this.validateProductionConfig();
  }

  get dbConfig() {
    const synchronize = this.getDatabaseSynchronizeOption();

    return {
      type: 'postgres' as const,
      host: process.env.DB_HOST || APP_CONSTANTS.DATABASE.DEFAULT_HOST,
      port: parseInt(process.env.DB_PORT || String(APP_CONSTANTS.DATABASE.DEFAULT_PORT)),
      username: process.env.DB_USERNAME || APP_CONSTANTS.DATABASE.DEFAULT_USERNAME,
      password: process.env.DB_PASSWORD || APP_CONSTANTS.DATABASE.DEFAULT_PASSWORD,
      database: process.env.DB_NAME || APP_CONSTANTS.DATABASE.DEFAULT_DATABASE,
      autoLoadEntities: true,
      synchronize,
    };
  }

  private getDatabaseSynchronizeOption(): boolean {
    if (process.env.DB_SYNCHRONIZE === 'true') {
      this.logger.warn('⚠️  DATABASE SYNCHRONIZE IS EXPLICITLY ENABLED');
      this.logger.warn('⚠️  This can cause DATA LOSS. Use only in development!');
      return true;
    }

    if (this.appConfig.isProduction) {
      this.logger.log('✅ Database synchronize is DISABLED in production');
      return false;
    }

    if (this.appConfig.isDevelopment) {
      this.logger.log('🔧 Database synchronize is ENABLED in development');
      return true;
    }

    this.logger.warn('⚠️  NODE_ENV not set properly, defaulting to synchronize: false');
    return false;
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
      port: parseInt(process.env.PORT || String(APP_CONSTANTS.DEFAULT_PORT)),
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  private validateProductionConfig(): void {
    if (this.appConfig.isProduction) {
      const issues: string[] = [];

      if (!process.env.JWT_SECRET) {
        issues.push('JWT_SECRET must be set in production');
      }

      if (!process.env.JWT_REFRESH_SECRET) {
        issues.push('JWT_REFRESH_SECRET must be set in production');
      }

      if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'password') {
        issues.push('DB_PASSWORD must be set with a strong password in production');
      }

      if (issues.length > 0) {
        this.logger.error('🚨 SECURITY ISSUES DETECTED IN PRODUCTION:');
        issues.forEach((issue) => this.logger.error(`   - ${issue}`));
        throw new Error('Production configuration validation failed. Check logs above.');
      }

      this.logger.log('✅ Production configuration validated successfully');
    }
  }
}

