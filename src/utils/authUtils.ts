import { AuthContextType } from "@/auth/AuthProvider";
import { Role } from "@/types/users/userTypes";

export function getUserRole(auth: AuthContextType): Role | undefined {
  return auth.token?.claims.role as Role | undefined;
}