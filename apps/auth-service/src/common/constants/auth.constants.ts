export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '7d',
  REFRESH_TOKEN_EXPIRATION_DAYS: 7,

  BCRYPT_SALT_ROUNDS: 10,

  DEFAULT_JWT_SECRET: 'your-secret-key',
  DEFAULT_JWT_REFRESH_SECRET: 'your-refresh-secret-key',
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

