import { Role } from "@/types/personTypes";
import { JSX } from "react";
import { useAuth } from "./useAuth";
import { PermissionDeniedError } from "@/utils/errors/PermissionDeniedError";

interface RoleBasedPageProps {
  rolePages: Partial<Record<Role, JSX.Element>>;
  unauthenticatedPage?: JSX.Element; 
}

export default function RoleBasedPage(props: RoleBasedPageProps) {
  const { rolePages, unauthenticatedPage } = props;
  const auth = useAuth();
  const role: Role = auth.token?.claims.role as Role;

  if (!role && unauthenticatedPage) {
    return unauthenticatedPage;
  } else if (rolePages[role]) {
    return rolePages[role];
  }
  throw new PermissionDeniedError("You do not have permission to access this page.")
}