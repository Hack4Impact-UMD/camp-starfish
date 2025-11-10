"use client";

import React, { JSX } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/styles/theme";
import AuthProvider from "@/auth/AuthProvider";
import { Notifications } from "@mantine/notifications";

export default function Providers({ children }: { children: JSX.Element }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="bottom-right" />
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  );
}
