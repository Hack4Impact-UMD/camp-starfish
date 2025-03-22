import { Role } from "@/types/personTypes";
import { JSX } from "react";
import { useAuth } from "./useAuth";

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
  throw Error("You do not have permission to access this page.")
}