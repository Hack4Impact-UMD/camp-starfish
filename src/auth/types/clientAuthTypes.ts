import { ParsedToken } from "firebase/auth";
import { Role } from "@/types/users/userTypes";

export interface NonAdminCustomClaims {
  role: Exclude<Role, "ADMIN">;
  campminderId: number;
}

export interface AdminCustomClaims {
  role: "ADMIN";
  campminderId: number;
  isSuperAdmin: boolean;
}

export type CustomClaims = NonAdminCustomClaims | AdminCustomClaims;

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;