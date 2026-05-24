import { HttpsError } from "firebase-functions/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { getUserByEmail } from "../data/firestore/users";

const checkAllowlist = beforeUserCreated(async (event) => {
  const email = event.data?.email;
  if (!email) {
    throw new HttpsError("failed-precondition", "User has no email address");
  }

  const devAndNpoEmails = [process.env.DEV_EMAILS?.split(',') || [], process.env.NPO_EMAILS?.split(',') || []].flat();
  if (devAndNpoEmails.includes(email) || process.env.NODE_ENV === 'development') {
    return { customClaims: { role: "ADMIN" } }
  }

  try {
    const user = await getUserByEmail(email);
    return {
      customClaims: {
        role: user.role,
        campminderId: user.id
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "No user with email found") {
        throw new HttpsError("permission-denied", "User does not exist");
      }
      throw new HttpsError("unknown", error.message);
    }
    throw new HttpsError("internal", "Failed to retrieve user information");
  }
});

export const accountManagementCloudFunctions = {
  checkAllowlist,
};