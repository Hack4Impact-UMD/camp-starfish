
/* notification component that represents:
- variant (success and error)
- title
- message
- icon
- close button (represented as x)
*/

import React from 'react';
import { Notification as MantineNotification, NotificationProps, ThemeIcon } from '@mantine/core';
import Image from 'next/image';
import successIcon from '@/assets/icons/notificationSuccess.svg';
import errorIcon from '@/assets/icons/notificationError.svg';

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
    <ThemeIcon color={isSuccess ? 'success' : 'error'} variant="filled" radius="xl" size={28} style={{ border: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50%' }}>
        <Image
          src={isSuccess ? successIcon : errorIcon}
          alt={isSuccess ? 'Success' : 'Error'}
          fill
          style={{ objectFit: 'contain', display: 'block', transform: 'scale(1.55)', transformOrigin: 'center' }}
          sizes="28px"
        />
      </div>
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
      closeButtonProps={{ size: 'xl', iconSize: 30 }}
      {...rest}
    >
      {message}
    </MantineNotification>
  );
}
