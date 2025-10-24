"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster } from 'react-hot-toast';
import type { NotificationId, NotificationItem, NotificationsContextValue } from "./types";
import { Notifications } from "@mantine/notifications";

// alias functions
import {
  cleanNotifications, // notifications.clean
  cleanNotificationsQueue, // notifications.cleanQueue
  hideNotification, // notifications.hide
  showNotification, // notifications.show
  updateNotification, // notifications.update
  updateNotificationsState, // notifications.updateState
} from '@mantine/notifications';

export default function NotificationsProviderWrapper({  }) {
  return (
    <>
      <Notifications position="top-center" />
    </>
  );
}


