import { io, Socket } from 'socket.io-client';
import { logger } from '@/utils/logger';
import { APP_CONSTANTS } from '@/constants/app.constants';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

type NotificationCallback = (notification: Notification) => void;

export class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Set<NotificationCallback> = new Set();
  private connected = false;

  connect(userId: string) {
    if (this.connected && this.socket) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: APP_CONSTANTS.WEBSOCKET.RECONNECTION_DELAY_MS,
      reconnectionAttempts: APP_CONSTANTS.WEBSOCKET.RECONNECTION_ATTEMPTS,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.socket?.emit('authenticate', { userId });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('notification', (notification: Notification) => {
      this.listeners.forEach((callback) => callback(notification));
    });

    this.socket.on('connect_error', (error) => {
      logger.error('WebSocket connection failed', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  onNotification(callback: NotificationCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async getNotifications(userId: string, limit = APP_CONSTANTS.PAGINATION.NOTIFICATIONS_DEFAULT_LIMIT): Promise<Notification[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit(
        'getNotifications',
        { userId, limit },
        (response: { data: Notification[]; total: number } | { error: string }) => {
          if ('error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response.data);
          }
        },
      );
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit(
        'markAsRead',
        { notificationId, userId },
        (response: { success: boolean; error?: string }) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        },
      );
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit(
        'markAllAsRead',
        { userId },
        (response: { success: boolean; error?: string }) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        },
      );
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();

