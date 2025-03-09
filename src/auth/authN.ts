import { GoogleAuthProvider, getRedirectResult, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    throw error;
  }
}

export async function signOut() {
  auth.signOut();
}
