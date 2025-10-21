export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '7d',
  REFRESH_TOKEN_EXPIRATION_DAYS: 7,

  BCRYPT_SALT_ROUNDS: 10,

  // ⚠️ SECURITY WARNING: These are DEVELOPMENT ONLY defaults
  // MUST be overridden with strong secrets via environment variables in production
  DEFAULT_JWT_SECRET: 'dev-secret-key-CHANGE-IN-PRODUCTION',
  DEFAULT_JWT_REFRESH_SECRET: 'dev-refresh-secret-key-CHANGE-IN-PRODUCTION',
  DEFAULT_RABBITMQ_URL: 'amqp://admin:admin@rabbitmq:5672',

  AUTH_QUEUE: 'auth_queue',

  MESSAGE_PATTERNS: {
    REGISTER: { cmd: 'register' },
    LOGIN: { cmd: 'login' },
    REFRESH: { cmd: 'refresh' },
    VALIDATE_USER: { cmd: 'validate-user' },
    REVOKE_TOKEN: { cmd: 'revoke-token' },
  },
};

