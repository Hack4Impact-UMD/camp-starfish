import { notifications } from '@mantine/notifications';

//TODO: add check and X icon
export const useNotifier = () => {
  const success = (message: string, title = 'Success') => {
    notifications.show({
      title,
      message,
      color: 'green',
      radius: 5,         
    });
  };

  const error = (message: string, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'red',
      radius: 5,
    });
  };

  return { success, error };
};