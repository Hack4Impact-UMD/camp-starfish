
/* notification component that represents:
- variant (success and error)
- title
- message
- icon
- close button (represented as x)
*/

import React from 'react';
import { Notification as MantineNotification, NotificationProps, ThemeIcon } from '@mantine/core';
import { Check, X as XIcon } from 'lucide-react';

//we only want to deal with two variants based on the figma
export type NotificationVariant = 'success' | 'error';

type Props = {
  variant?: NotificationVariant;
  title?: React.ReactNode;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
} & Omit<NotificationProps, 'icon' |'color' | 'title' | 'withCloseButton' | 'onClose' >;

const variantToColor: Record<NotificationVariant, NotificationProps['color']> = {
  success: 'success',
  error: 'error',
};

const DefaultIcon = ({ variant }: { variant: NotificationVariant }) => {
  const isSuccess = variant === 'success';
  return (
    <ThemeIcon color={isSuccess ? 'success' : 'error'} variant="filled" radius="xl" size={28}>
      {isSuccess ? (
        <Check size={16} color="#fff" strokeWidth={3} />
      ) : (
        <XIcon size={16} color="#fff" strokeWidth={3} />
      )}
    </ThemeIcon>
  );
};

export const Notification: React.FC<Props> = ({
  variant = 'success',
  title,
  message,
  icon,
  onClose,
  ...rest
}) => {
  const color = variantToColor[variant];

  return (
    <MantineNotification
      withCloseButton
      onClose={onClose}
      color={color}
      title={title}
      icon={icon ?? <DefaultIcon variant={variant} />}
      {...rest}
    >
      {message}
    </MantineNotification>
  );
}
;

export default Notification;
