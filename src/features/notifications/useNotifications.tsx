import { notifications } from '@mantine/notifications';
import NotificationIcon from './NotificationIcon';

export default function useNotifications() {
  const success = (message: React.ReactNode, title = 'Success') => {
    return notifications.show({
      title,
      message,
      color: 'success',
      icon: <NotificationIcon variant="success" />, 
    });
  };

  const error = (message: React.ReactNode, title = 'Error') => {
    return notifications.show({
      title,
      message,
      color: 'error',
      icon: <NotificationIcon variant="error" />,
    });
  };

  return { success, error };
};