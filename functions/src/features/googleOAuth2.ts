import { onCall, onRequest } from "firebase-functions/https";
import { getUrlFromRequest, isIdTokenValid } from "../serverUtils";
import { DecodedIdTokenWithCustomClaims } from "../types/serverAuthTypes";
import { CustomClaims, GoogleTokens } from "@/auth/types/clientAuthTypes";
import { adminAuth } from "../config/firebaseAdminConfig";
import moment from "moment";
import { getFunctionsURL } from "@/utils/firebaseUtils";

export const startOAuth2Flow = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const url = getUrlFromRequest(req);
  const idToken = url.searchParams.get('idToken');
  let decodedToken: DecodedIdTokenWithCustomClaims | false;
  if (!(decodedToken = await isIdTokenValid(idToken))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const redirectUri = encodeURIComponent(getFunctionsURL("handleOAuth2Code"));
  const scopes: string = encodeURIComponent([].join(' '));
  if (!scopes) {
    res.status(400).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    return;
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&login_hint=${decodedToken.email}&access_type=offline&prompt=consent&state=${idToken}`;
  res.status(303).redirect(authUrl);
});

export const handleOAuth2Code = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const url = getUrlFromRequest(req);
  const idToken = url.searchParams.get('state');
  let decodedToken: DecodedIdTokenWithCustomClaims | false;
  if (!(decodedToken = await isIdTokenValid(idToken))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.status(400).send('Bad Request');
    return;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code || "",
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getFunctionsURL('handleOAuth2Code'),
      grant_type: 'authorization_code',
    }),
  });
  if (!response.ok) {
    res.status(500).send('Internal Server Error');
    return;
  }
  const tokens = await response.json() as {
    refresh_token: string;
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  const customClaims: CustomClaims = {
    role: decodedToken.role,
    googleTokens: {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expirationTime: moment().add(tokens.expires_in, 'seconds').toISOString(),
    }
  }
  await adminAuth.setCustomUserClaims(decodedToken.uid, customClaims);
  res.status(303).redirect(`${process.env.NEXT_PUBLIC_DOMAIN}?refreshIdToken=true`);
});

export const refreshAccessToken = onCall(async (req) => {
  if (!req.auth) {
    throw new Error("Unauthorized");
  }

  const refreshToken = req.auth.token.googleTokens?.refreshToken;
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  let tokenData: GoogleTokens;
  try {
    tokenData = await fetchAccessToken(refreshToken);
  } catch {
    throw new Error("Failed to refresh access token");
  }

  const customClaims: CustomClaims = {
    role: req.auth.token.role,
    googleTokens: tokenData
  }
  await adminAuth.setCustomUserClaims(req.auth.uid, customClaims);
  return tokenData.accessToken;
});

async function fetchAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }
  const tokenData = await response.json() as {
    refresh_token: string;
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  return {
    refreshToken,
    accessToken: tokenData.access_token,
    expirationTime: moment().add(tokenData.expires_in, 'seconds').toISOString()
  }
}