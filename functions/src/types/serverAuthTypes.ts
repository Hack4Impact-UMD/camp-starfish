import { CustomClaims } from "@/auth/types/clientAuthTypes";
import { DecodedIdToken } from "firebase-admin/auth";
import { Collection as ClientCollection } from "@/data/firestore/utils";

export type DecodedIdTokenWithCustomClaims = DecodedIdToken & CustomClaims;

export const Collection = {
  ...ClientCollection,
  GOOGLE_OAUTH2_TOKENS: "googleOAuth2Tokens",
} as const