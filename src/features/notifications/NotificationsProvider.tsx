
//provider that allows us to create notifications throughout
"use client";
import React from 'react';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Notifications position="top-center" zIndex={4000} />
      {children}
    </>
  );
}
