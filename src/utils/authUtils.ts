import { AuthContextType } from "@/auth/AuthProvider";
import { CounselorRole } from "@/types/people/personTypes";

export function getUserRole(auth: AuthContextType): CounselorRole | undefined {
  return auth.token?.claims.role as CounselorRole | undefined;
}