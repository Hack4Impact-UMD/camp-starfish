import { auth } from "@/config/firebase";
import { CampStarfishError } from "@/utils/errors/CampStarfishErrors";
import { PermissionDeniedError } from "@/utils/errors/PermissionDeniedError";
import { InvalidArgumentsError } from "@/utils/errors/InvalidArgumentsError";
import { getFunctionsURL } from "@/utils/firebaseUtils";

export async function startGoogleOAuth2Flow(scopes: string[]) {
  const user = auth.currentUser;
  if (!user) {
    throw new PermissionDeniedError("You must be logged in to access this feature.");
  }

  if (scopes.length === 0) {
    throw new InvalidArgumentsError("No scopes provided");
  }
  const scope = scopes.join(' ');

  const redirectUri = encodeURIComponent(getFunctionsURL("handleOAuth2Code"));
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&login_hint=${user.email}&access_type=offline&prompt=consent&include_granted_scopes=true`;
  window.location.href = authUrl;
}