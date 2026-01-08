"use client";
import RequireAuth from "@/auth/RequireAuth";
import AlbumPage from "./AlbumPage";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/personTypes";

export default function Page() {
  const { token } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"];
  
  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => allowedRoles.some((role: Role) => token?.claims.role === role),
          component: <AlbumPage />,
        },
      ]}
    />
  );
}