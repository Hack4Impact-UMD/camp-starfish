import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";
import { FirebaseError } from "firebase/app";
import { wrapAuthError } from "@/utils/errors/CampStarfishErrors";
import { wrap } from "module";

export async function signInWithGooglePopup() {
  try {
    return signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error: unknown) {
    if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") {
      return;
    }
    throw wrapAuthError(error, "Failed to sign in with Google");
  }
}

export async function signInWithMicrosoftPopup() {
  try {
    return signInWithPopup(auth, new OAuthProvider("microsoft.com"));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") {
      return;
    }
    throw wrapAuthError(error, "Failed to sign in with Microsoft");
  }
}

export async function signOut() {
  auth.signOut();
}
