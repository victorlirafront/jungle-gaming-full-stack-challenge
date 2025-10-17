export interface NotificationBroadcastEvent {
  userId: string;
  notification: {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

