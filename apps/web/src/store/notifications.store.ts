import { create } from 'zustand';
import { Notification, webSocketService } from '@/services';
import { logger } from '@/utils/logger';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  unsubscribe: (() => void) | null;

  initializeWebSocket: (userId: string) => void;
  disconnectWebSocket: () => void;
  loadNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isLoading: false,
  unsubscribe: null,

  initializeWebSocket: (userId: string) => {
    if (get().unsubscribe) {
      get().unsubscribe?.();
    }

    webSocketService.connect(userId);

    const unsubscribe = webSocketService.onNotification((notification) => {
      get().addNotification(notification);
    });

    set({ isConnected: true, unsubscribe });
    get().loadNotifications(userId);
  },

  disconnectWebSocket: () => {
    if (get().unsubscribe) {
      get().unsubscribe?.();
    }
    
    webSocketService.disconnect();
    set({ isConnected: false, notifications: [], unreadCount: 0, unsubscribe: null });
  },

  loadNotifications: async (userId: string) => {
    try {
      set({ isLoading: true });
      const notifications = await webSocketService.getNotifications(userId);
      set({ notifications });
      get().updateUnreadCount();
    } catch (error) {
      logger.error('Failed to load notifications', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string, userId: string) => {
    try {
      await webSocketService.markAsRead(notificationId, userId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));

      get().updateUnreadCount();
    } catch (error) {
      logger.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await webSocketService.markAllAsRead(userId);

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      logger.error('Failed to mark all notifications as read', error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) {
        return state;
      }
      return {
        notifications: [notification, ...state.notifications],
      };
    });
    get().updateUnreadCount();
  },

  updateUnreadCount: () => {
    const count = get().notifications.filter((n) => !n.read).length;
    set({ unreadCount: count });
  },
}));

