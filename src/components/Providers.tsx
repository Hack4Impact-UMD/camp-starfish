"use client";

import AuthProvider from "@/auth/AuthProvider";
import { queryClient } from "@/config/query";
import { theme } from "@/styles/theme";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { JSX } from "react";

interface ProvidersProps {
  children: JSX.Element;
}

export default function Providers(props: ProvidersProps) {
  const { children } = props;
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications />
          <AuthProvider>{children}</AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
