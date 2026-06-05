import { CustomClaims } from "@/auth/types/clientAuthTypes";
import { DecodedIdToken } from "firebase-admin/auth";

export type DecodedIdTokenWithCustomClaims = DecodedIdToken & Partial<CustomClaims>;