// add notifications component 
"use client";
import React from 'react';
import { MantineProvider } from '@mantine/core';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../features/notifications/toastStyles.css';

export function NotificationsProviderWrapper({}) {
  return (
    <MantineProvider>
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
      />
    </MantineProvider>
  );
}
