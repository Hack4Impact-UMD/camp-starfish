"use client";

import RequireAuth from "@/auth/RequireAuth";
import LoginPage from "./LoginPage";
import RoleBasedPage from "@/auth/RoleBasedPage";
import EmployeeHomePage from "./EmployeeHomePage";
import ParentHomePage from "./ParentHomePage";

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { theme } from '../styles/theme';

export default function HomePage() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <RequireAuth
          allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}
          allowUnauthenticated
        >
          <RoleBasedPage
            rolePages={{
              ADMIN: <EmployeeHomePage />,
              PARENT: <ParentHomePage />,
              PHOTOGRAPHER: <EmployeeHomePage />,
              STAFF: <EmployeeHomePage />,
            }}
            unauthenticatedPage={<LoginPage />}
          />
        </RequireAuth>
      </ModalsProvider>
    </MantineProvider>
    
  );
}
