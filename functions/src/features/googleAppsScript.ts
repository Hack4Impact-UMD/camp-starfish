import { onCall } from "firebase-functions/https";
import { Collection } from "../types/serverAuthTypes";
import { adminDb } from "../config/firebaseAdminConfig";
import moment from "moment";
import { Credentials, OAuth2Client } from "google-auth-library";
import { getFunctionsURL } from "@/utils/firebaseUtils";
import { refreshAccessToken } from "./googleOAuth2";
import { GoogleApis } from "googleapis";

export const appsScriptEndpoint = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) {
    throw new Error("You must be logged in to access this feature.");
  }

  const credentialsSnapshot = await adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid).get();
  if (!credentialsSnapshot.exists) {
    throw new Error("No Google OAuth2 credentials found");
  }

  const oAuth2Client = new OAuth2Client({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [getFunctionsURL("handleOAuth2Code")],
    credentials: credentialsSnapshot.data() as Credentials,
  });

  if (oAuth2Client.credentials.expiry_date && moment(oAuth2Client.credentials.expiry_date).isBefore(moment())) {
    await refreshAccessToken(oAuth2Client, uid);
  }

  const { functionName, parameters } = req.data;
  const data = (await new GoogleApis({ auth: oAuth2Client }).script('v1').scripts.run({
    scriptId: process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID,
    requestBody: {
      function: functionName,
      parameters,
    }
  })).data;

  if (data.error) {
    throw new Error("An unexpected error occurred. Please try again later.");
  }
  return data.response?.result;
});
