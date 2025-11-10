import React from "react";
import {
  Notification as MantineNotification,
  NotificationProps as MantineNotificationProps,
  ThemeIcon,
} from "@mantine/core";
import Image from "next/image";
import successIcon from "@/assets/icons/notificationSuccess.svg";
import errorIcon from "@/assets/icons/notificationError.svg";

export type NotificationVariant = "success" | "error";

interface NotificationProps extends MantineNotificationProps {
  message?: React.ReactNode;
  variant: NotificationVariant;
}

const DefaultIcon = ({ variant }: { variant: NotificationVariant }) => {
  const isSuccess = variant === "success";
  return (
    <ThemeIcon
      color={isSuccess ? "success" : "error"}
      variant="filled"
      radius="xl"
      size={28}
      style={{ border: "none" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "50%",
        }}
      >
        <Image
          src={isSuccess ? successIcon : errorIcon}
          alt={isSuccess ? "Success" : "Error"}
          fill
          style={{
            objectFit: "contain",
            display: "block",
            transform: "scale(1.55)",
            transformOrigin: "center",
          }}
          sizes="28px"
        />
      </div>
    </ThemeIcon>
  );
};

export default function Notification(props: NotificationProps) {
  const { variant, message, onClose, ...rest } = props;
  return (
    <MantineNotification
      withCloseButton
      onClose={onClose}
      icon={<DefaultIcon variant={variant} />}
      closeButtonProps={{ size: "xl", iconSize: 30 }}
      {...rest}
    >
      {message}
    </MantineNotification>
  );
}
