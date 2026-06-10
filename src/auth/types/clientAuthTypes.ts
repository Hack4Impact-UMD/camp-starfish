import { ParsedToken } from "firebase/auth";
import { Role } from "@/types/users/userTypes";

export interface CustomClaims {
  role: Role;
  // Absent for dev/NPO admin accounts, which are allowlisted by email and have
  // no /users doc (see checkAllowlist in functions/src/features/accountManagement.ts).
  campminderId?: number;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;