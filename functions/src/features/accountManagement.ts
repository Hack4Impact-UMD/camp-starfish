import { HttpsError, onCall } from "firebase-functions/https";
import { adminAuth } from "../config/firebaseAdminConfig";

const checkWhitelist = onCall(async (req) => {
  return new Promise(async (resolve, reject) => {
    const uid = await req.auth?.uid;
    if (!uid) {
      reject("Unauthenticated");
      throw new HttpsError("failed-precondition", "Unauthenticated");
    }

    const devAndNpoEmails = [process.env.DEV_EMAILS?.split(',') || [], process.env.NPO_EMAILS?.split(',') || []].flat();
    if (devAndNpoEmails.includes(req.auth?.token.email ?? '') || process.env.NODE_ENV === 'development') {
      await adminAuth.setCustomUserClaims(uid, { role: "ADMIN" });
      resolve(`User with uid ${uid} has been given ADMIN role and permission to access production environment`);
      return;
    }
  });
});

export const accountManagementCloudFunctions = {
  checkWhitelist
}