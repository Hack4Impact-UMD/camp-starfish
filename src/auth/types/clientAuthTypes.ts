import { ParsedToken } from "firebase/auth";
import { UserRole } from "@/types/userTypes";

export interface CustomClaims {
  role?: UserRole;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;