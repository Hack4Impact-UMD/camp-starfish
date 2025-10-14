import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";

export async function signInWithGooglePopup() {
  try {
    return signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message !== "auth/popup-closed-by-user") {
        throw Error(error.message);
      }
      return;
    }
    throw Error("An unexpected error occurred");
  }
}

export async function signInWithMicrosoftPopup() {
  try {
    return signInWithPopup(auth, new OAuthProvider("microsoft.com"));
  } catch (error : unknown) {
    if (error instanceof Error) {
      if (error.message !== "auth/popup-closed-by-user") {
        throw Error(error.message)
      }
      return;
    }
    throw Error("An unexpected error occurred");
  }
}

export async function signOut() {
  auth.signOut();
}
