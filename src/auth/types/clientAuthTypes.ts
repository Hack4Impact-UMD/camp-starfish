import { ParsedToken } from "firebase/auth";
import { UserRole } from "@/types/users/userTypes";

export interface CustomClaims {
  role?: UserRole;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;