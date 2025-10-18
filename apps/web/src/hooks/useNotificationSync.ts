import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationsStore } from '@/store/notifications.store';
import { TASKS_QUERY_KEY, COMMENTS_QUERY_KEY, HISTORY_QUERY_KEY } from './useTasks';

export function useNotificationSync() {
  const queryClient = useQueryClient();
  const notifications = useNotificationsStore((state) => state.notifications);

  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[0];
    const notificationType = latestNotification.type;
    const taskId = latestNotification.data?.taskId as string | undefined;

    if (!taskId) return;

    switch (notificationType) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
      case 'TASK_STATUS_CHANGED':
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
        queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, taskId] });
        break;
      
      case 'TASK_COMMENTED':
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
        queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, taskId] });
        queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, taskId] });
        break;
      
      case 'TASK_DELETED':
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        break;
    }
  }, [notifications, queryClient]);
}

