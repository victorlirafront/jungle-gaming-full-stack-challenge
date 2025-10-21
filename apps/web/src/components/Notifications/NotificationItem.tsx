import { Notification } from '@/services';
import { APP_CONSTANTS } from '@/constants/app.constants';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'TASK_CREATED':
      return '📝';
    case 'TASK_UPDATED':
      return '✏️';
    case 'TASK_DELETED':
      return '🗑️';
    case 'TASK_ASSIGNED':
      return '👤';
    case 'TASK_COMMENTED':
      return '💬';
    case 'TASK_STATUS_CHANGED':
      return '🔄';
    default:
      return '🔔';
  }
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / APP_CONSTANTS.TIME.MS_IN_SECOND);

  const SECONDS_IN_HOUR = APP_CONSTANTS.TIME.SECONDS_IN_MINUTE * APP_CONSTANTS.TIME.MINUTES_IN_HOUR;
  const SECONDS_IN_DAY = SECONDS_IN_HOUR * APP_CONSTANTS.TIME.HOURS_IN_DAY;

  if (diffInSeconds < APP_CONSTANTS.TIME.SECONDS_IN_MINUTE) return 'Agora há pouco';
  if (diffInSeconds < SECONDS_IN_HOUR) {
    return `Há ${Math.floor(diffInSeconds / APP_CONSTANTS.TIME.SECONDS_IN_MINUTE)} min`;
  }
  if (diffInSeconds < SECONDS_IN_DAY) {
    return `Há ${Math.floor(diffInSeconds / SECONDS_IN_HOUR)} h`;
  }
  return `Há ${Math.floor(diffInSeconds / SECONDS_IN_DAY)} dias`;
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {getTimeAgo(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

