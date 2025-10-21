export const NOTIFICATIONS_CONSTANTS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  RETENTION_DAYS: 30,

  RATE_LIMIT: {
    CREATE: {
      TTL: 60000,
      LIMIT: 20,
    },
    MARK_AS_READ: {
      TTL: 10000,
      LIMIT: 50,
    },
  },
} as const;

