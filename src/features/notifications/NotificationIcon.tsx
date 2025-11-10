import { ThemeIcon } from "@mantine/core";
import { NotificationVariant } from "./notificationTypes";
import Image from "next/image";
import successIcon from "@/assets/icons/notificationSuccess.svg";
import errorIcon from "@/assets/icons/notificationError.svg";

interface NotificationIconProps {
  variant: NotificationVariant;
}

export default function NotificationIcon(props: NotificationIconProps) {
  const { variant } = props;
  const isSuccess = variant === "success";
  return (
    <ThemeIcon
      color={isSuccess ? "success" : "error"}
      variant="filled"
      radius="xl"
      size={28}
      style={{ border: "none" }}
    >
      <Image
        src={isSuccess ? successIcon : errorIcon}
        alt={isSuccess ? "Success" : "Error"}
        fill
        className="tr"
        style={{
          objectFit: "contain",
          display: "block",
          transform: "scale(1.55)",
          transformOrigin: "center",
        }}
        sizes="28px"
      />
    </ThemeIcon>
  );
};