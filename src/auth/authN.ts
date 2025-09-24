import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

export async function signOut() {
  auth.signOut();
}
