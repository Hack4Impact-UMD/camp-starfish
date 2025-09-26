import { CustomClaims } from "@/auth/types/clientAuthTypes";
import { DecodedIdToken } from "firebase-admin/auth";

export type DecodedIdTokenWithCustomClaims = DecodedIdToken & CustomClaims;

export interface GoogleOAuth2RefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: 'Bearer';
  id_token: string;
}

export type GoogleOAuth2CodeResponse = GoogleOAuth2RefreshResponse & { refresh_token: string };