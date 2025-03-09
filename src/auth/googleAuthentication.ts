import { Role } from '../types/personTypes';
import { auth, functions } from '../config/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { httpsCallable } from 'firebase/functions';

async function verifyGoogleToken(googleAccessToken: string | undefined): Promise<boolean> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${googleAccessToken}`);
    const data = await response.json();

    if (data.error) { 
        console.error("Invalid Token");
        return false;
    } else {
        console.log("Token is valid");
        return true;
    }
}

async function signInWithGoogle(router: AppRouterInstance): Promise<void> {
    const provider = new GoogleAuthProvider();
    
    provider.addScope("https://www.googleapis.com/auth/forms.body");
    provider.addScope("https://www.googleapis.com/auth/forms.responses.readonly");
    provider.addScope("https://www.googleapis.com/auth/spreadsheets");
    provider.addScope("https://www.googleapis.com/auth/gmail.send");
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      await verifyGoogleToken(accessToken);
  
      const idTokenResult = await auth.currentUser?.getIdTokenResult();
      const role: Role | undefined = idTokenResult?.claims.role as (Role | undefined);
  
      switch (role) {
        case undefined: {
          // Instead of redirecting, throw an error to be handled by the component.
          throw new Error("Email not registered with CampMinder. Please try again or contact admin.");
        }
        case "PARENT": {
          const res = await fetch(`/api/auth/refreshToken`);
          const valid = await res.json();
          if (!valid) {
            const validateToken = httpsCallable(functions, "checkRefreshToken");
            await validateToken();
          }
          router.push("/parent-dashboard");
          break;
        }
        case "STAFF":
        case "PHOTOGRAPHER":
        case "ADMIN": {
          router.push("/admin-dashboard");
          break;
        }
        default: {
          console.error("Unknown role", role);
          break;
        }
      }
    } catch (error: unknown) {
      console.error("Unable to sign in with Google", error);
      // Rethrow the error so the component can catch it.
      throw error;
    }
  }  

async function logOut(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await auth.signOut();
  }
}

export { signInWithGoogle, logOut };
