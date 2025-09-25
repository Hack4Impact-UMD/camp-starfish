import { Request } from "firebase-functions/https";
import { adminAuth } from "./config/firebaseAdminConfig";
import { DecodedIdTokenWithCustomClaims } from "./types/serverAuthTypes";

export function getUrlFromRequest(req: Request) {
  return new URL(`${req.protocol}://${req.get('host')}${req.url}`);
}

export async function isIdTokenValid(idToken: string | undefined | null): Promise<DecodedIdTokenWithCustomClaims | false> {
  if (!idToken) {
    return false;
  }

  let decodedToken: DecodedIdTokenWithCustomClaims | false;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    return false;
  }
  return decodedToken;
}