import { notifications } from '@mantine/notifications';

//we deal with two variants: error and success

export const notify = (message: string, title?: string) => {
  notifications.show({ message, title });
};

export const success = (message: string, title = 'Success') => {
  notifications.show({ message, title, color: 'green' });
};

export const error = (message: string, title = 'Error') => {
  notifications.show({ message, title, color: 'red' });
};

//remove notification when button is pressed
export const onClick = (id: number) => {
  notifications.hide(String(id));
};


