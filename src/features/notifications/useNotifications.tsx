import { notifications } from '@mantine/notifications';
import { MdCheckCircle, MdError } from 'react-icons/md';

export default function useNotifications() {
  const success = (message: React.ReactNode, title = 'Success') => {
    return notifications.show({
      title,
      message,
      variant: 'success',
      icon: <MdCheckCircle size={100} className="text-success" />, 
    });
  };

  const error = (message: React.ReactNode, title = 'Error') => {
    return notifications.show({
      title,
      message,
      variant: 'error',
      icon: <MdError size={100} className="text-error" />,
    });
  };

  return { success, error };
};