"use client";

import { Role } from "@/types/personTypes";
import { useAuth } from "./useAuth";
import { redirect } from "next/navigation";
import { JSX } from "react";

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles: Role[];
  allowUnauthenticated?: boolean;
}

export default function RequireAuth(props: RequireAuthProps) {
  const { children, allowedRoles, allowUnauthenticated = false } = props;
  const { token } = useAuth();

  if (
    allowedRoles.some((role: Role) => token?.claims.role === role) ||
    (allowUnauthenticated && !token)
  ) {
    return children;
  }

  redirect('/');
}
