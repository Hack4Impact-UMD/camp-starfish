import { ParsedToken } from "firebase/auth";
import { UserRole } from "@/types/personTypes";

export interface CustomClaims {
  role?: UserRole;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;