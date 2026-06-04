import { ParsedToken } from "firebase/auth";
import { Role } from "@/types/users/userTypes";

export interface CustomClaims {
  role?: Role;
  campminderId?: number;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;