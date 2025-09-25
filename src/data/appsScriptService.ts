import { ParsedTokenWithCustomClaims } from "@/auth/types/clientAuthTypes";
import { auth } from "@/config/firebase";

async function callAppsScript(functionName: string, parameters?: any[]): Promise<any> {
  const claims = ((await auth.currentUser?.getIdTokenResult())?.claims as ParsedTokenWithCustomClaims);
  if (!auth.currentUser) {
    throw new Error("You must be logged in to access this feature.");
  } else if (!claims.role || claims.role !== 'ADMIN') {
    throw new Error("You do not have permission to access this feature.");
  } else if (!claims.googleTokens?.accessToken) {
    // TODO: Redirect to OAuth flow
    throw new Error("Invalid access token. Please authorize Google to access this feature.")
  }

  const response = await fetch(
    `https://script.googleapis.com/v1/scripts/${process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID}:run`,
    {
      method: "POST",
      body: JSON.stringify({
        function: functionName,
        parameters,
      }),
      headers: {
        Authorization: `Bearer ${claims.googleTokens.accessToken}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );
  const data = await response.json();
  if (data.error) {
    throw new Error("An unexpected error occurred. Please try again later.");
  }
  return data.response.result;
}