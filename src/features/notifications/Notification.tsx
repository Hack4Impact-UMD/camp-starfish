import React from "react";
import {
  Notification as MantineNotification,
  NotificationProps as MantineNotificationProps,
} from "@mantine/core";
import NotificationIcon from "./NotificationIcon";

export type NotificationVariant = "success" | "error";

interface NotificationProps extends MantineNotificationProps {
  message?: React.ReactNode;
  variant: NotificationVariant;
}

export default function Notification(props: NotificationProps) {
  const { variant, message, ...rest } = props;
  return (
    <MantineNotification
      withCloseButton
      icon={<NotificationIcon variant={variant} />}
      closeButtonProps={{ size: "xl", iconSize: 30 }}
      {...rest}
    >
      {message}
    </MantineNotification>
  );
}
