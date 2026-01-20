import { onCall } from "firebase-functions/https";
import moment from "moment";
import { OAuth2Client } from "google-auth-library";
import { getFunctionsURL } from "@/utils/firebaseUtils";
import { refreshAccessToken } from "./googleOAuth2";
import { GoogleApis } from "googleapis";
import { getGoogleCredentialsByUid } from "../data/firestore/googleCredentials";

const appsScriptEndpoint = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) {
    throw new Error("You must be logged in to access this feature.");
  }

  const credentials = await getGoogleCredentialsByUid(uid);
  const oAuth2Client = new OAuth2Client({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [getFunctionsURL("handleOAuth2Code")],
    credentials: credentials,
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

export const googleAppsScriptCloudFunctions = {
  appsScriptEndpoint
}