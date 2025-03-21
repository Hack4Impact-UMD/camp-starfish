import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";

export async function signInWithGooglePopup() {
  try {
    return signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error: any) {
    if (error.message !== "auth/popup-closed-by-user") {
      throw Error(error.message);
    }
  }
}

export async function signOut() {
  auth.signOut();
}
