import { onRequest } from "firebase-functions/https";
import { adminAuth, adminDb } from "../config/firebaseAdminConfig";
import { getFunctionsURL } from "@/utils/firebaseUtils";
import { Credentials, OAuth2Client, TokenPayload } from "google-auth-library";
import { Collection } from "../types/serverAuthTypes";

export const handleOAuth2Code = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}`);
    return;
  }

  const code = req.query.code as string;
  if (!code) {
    res.status(303).send(`${process.env.NEXT_PUBLIC_DOMAIN}`);
    return;
  }

  const oAuth2Client = new OAuth2Client({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [getFunctionsURL('handleOAuth2Code')],
  })

  let tokens: Credentials;
  try {
    tokens = (await oAuth2Client.getToken(code)).tokens;
  } catch {
    res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}?error=true`);
    return;
  }

  let decodedIdToken: TokenPayload;
  if (!tokens.id_token || !(decodedIdToken = JSON.parse(atob(tokens.id_token.split('.')[1])) as TokenPayload).email || !decodedIdToken.email_verified) {
    res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}?error=true`);
    return;
  }

  const email = decodedIdToken.email;
  let user;
  try {
    user = await adminAuth.getUserByEmail(email);
  } catch {
    res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}?error=true`);
    return;
  }

  const uid = user.uid;
  await adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid).set(tokens);

  res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}?success=true`);
});

export async function refreshAccessToken(oauth2Client: OAuth2Client, uid: string): Promise<void> {
  if (!oauth2Client.credentials.refresh_token) {
    throw new Error("Refresh token not found");
  }
  let tokens: Credentials;
  try {
    tokens = (await oauth2Client.refreshAccessToken()).credentials;
  } catch {
    throw new Error("Failed to refresh access token");
  }
  oauth2Client.setCredentials(tokens);
  await adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid).set(tokens);
}
