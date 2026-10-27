"use client";

import RequireAuth from "@/auth/RequireAuth";
import LoginPage from "./LoginPage";
import EmployeeHomePage from "./EmployeeHomePage";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";

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
          authFn: () =>
            role === "ADMIN" || role === "STAFF",
          component: <EmployeeHomePage />,
        },
      ]}
    />
  );
}