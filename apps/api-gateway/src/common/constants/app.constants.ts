export const APP_CONSTANTS = {
  DEFAULT_PORT: 3001,
  
  THROTTLE: {
    TTL: 1000,
    LIMIT: 10,
  },
  
  RABBITMQ: {
    DEFAULT_URL: 'amqp://admin:admin@rabbitmq:5672',
    QUEUES: {
      GATEWAY: 'gateway_queue',
      AUTH: 'auth_queue',
      TASKS: 'tasks_queue',
      NOTIFICATIONS: 'notifications_queue',
    },
  },
  
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    DEFAULT_OFFSET: 0,
    MAX_LIMIT: 100,
  },
} as const;

