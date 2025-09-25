import { ParsedToken } from "firebase/auth";
import { UserRole } from "@/types/personTypes";

export interface GoogleTokens {
  refreshToken: string;
  accessToken: string;
  expirationTime: string;
}

export interface CustomClaims {
  googleTokens?: GoogleTokens;
  role?: UserRole;
}

export type ParsedTokenWithCustomClaims = ParsedToken & CustomClaims;