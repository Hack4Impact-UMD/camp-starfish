"use client";

import RequireAuth from "@/auth/RequireAuth";
import LoginPage from "./LoginPage"

export default function HomePage() {
  return (
    <RequireAuth allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]} allowUnauthenticated>
      <LoginPage />
    </RequireAuth>
  );
}
