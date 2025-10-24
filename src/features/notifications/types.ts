export type NotificationVariant = "success" | "error";

export type NotificationId = string;

export interface NotificationItem {
  id: NotificationId;
  message: string;
  title?: string;
  variant?: NotificationVariant;
}

export interface NotificationsContextValue {
  items: NotificationItem[];
  notify: (input: Omit<NotificationItem, "id"> & { id?: NotificationId }) => NotificationId;
  success: (message: string, opts?: { title?: string }) => NotificationId;
  error: (message: string, opts?: { title?: string }) => NotificationId;
  clear: () => void;
}
