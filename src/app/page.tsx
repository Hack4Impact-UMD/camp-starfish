"use client";

import RequireAuth from "@/auth/RequireAuth";
import LoginPage from "./LoginPage";
import EmployeeHomePage from "./EmployeeHomePage";
import ParentHomePage from "./ParentHomePage";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/personTypes";

export default function HomePage() {
  const { token } = useAuth();
  const role = token?.claims.role as Role | undefined;

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => !token,
          component: <LoginPage />,
        },
        {
          authFn: () => role === "PARENT",
          component: <ParentHomePage />,
        },
        {
          authFn: () => role === "ADMIN" || role === "PHOTOGRAPHER" || role === "STAFF",
          component: <EmployeeHomePage />,
        },
      ]}
    />
  );
}
