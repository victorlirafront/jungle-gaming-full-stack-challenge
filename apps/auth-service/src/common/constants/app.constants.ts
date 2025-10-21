export const APP_CONSTANTS = {
  DEFAULT_PORT: 3002,
  
  DATABASE: {
    DEFAULT_HOST: 'db',
    DEFAULT_PORT: 5432,
    DEFAULT_USERNAME: 'postgres',
    DEFAULT_PASSWORD: 'password',
    DEFAULT_DATABASE: 'challenge_db',
  },

  RATE_LIMIT: {
    LOGIN: {
      TTL: 60000,
      LIMIT: 5,
    },
    REGISTER: {
      TTL: 3600000,
      LIMIT: 3,
    },
    CHANGE_PASSWORD: {
      TTL: 60000,
      LIMIT: 3,
    },
  },
} as const;

