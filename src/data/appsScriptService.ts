import { auth, functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function callAppsScript(functionName: string, parameters?: any[]): Promise<any> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to access this feature.");
  }
  return (await httpsCallable(functions, 'appsScriptEndpoint')({
    functionName,
    parameters
  })).data;
}