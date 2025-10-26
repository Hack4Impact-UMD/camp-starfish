import { notifications } from '@mantine/notifications';

//TODO: add check and X icon

export const useNotifier = () => {

  //we have the success and error variants for notifications
  const success = (message: string, title = 'Success') => {
    notifications.show({
      title,
      message,
      color: 'success',
      radius: 5,         
    });
  };

  const error = (message: string, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'error',
      radius: 5,
    });
  };

  return { success, error };
};