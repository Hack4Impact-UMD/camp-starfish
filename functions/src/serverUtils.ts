import { adminAuth } from "./config/firebaseAdminConfig";
import { DecodedIdTokenWithCustomClaims } from "./types/serverAuthTypes";

export async function isIdTokenValid(idToken: string | undefined | null): Promise<DecodedIdTokenWithCustomClaims | false> {
  if (!idToken) {
    return false;
  }

  let decodedToken: DecodedIdTokenWithCustomClaims | false;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return false;
  }
  return decodedToken;
}