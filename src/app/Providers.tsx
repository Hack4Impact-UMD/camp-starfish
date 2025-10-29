"use client";

import React from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/styles/theme";
import AuthProvider from "@/auth/AuthProvider";
import { NotificationsProvider } from "@/features/notifications";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
