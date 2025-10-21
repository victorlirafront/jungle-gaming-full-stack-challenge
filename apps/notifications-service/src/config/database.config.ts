import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseConfig');

export function getDatabaseSynchronizeOption(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';

  if (process.env.DB_SYNCHRONIZE === 'true') {
    logger.warn('⚠️  DATABASE SYNCHRONIZE IS EXPLICITLY ENABLED');
    logger.warn('⚠️  This can cause DATA LOSS. Use only in development!');
    return true;
  }

  if (isProduction) {
    logger.log('✅ Database synchronize is DISABLED in production');
    return false;
  }

  if (isDevelopment) {
    logger.log('🔧 Database synchronize is ENABLED in development');
    return true;
  }

  logger.warn('⚠️  NODE_ENV not set properly, defaulting to synchronize: false');
  return false;
}

