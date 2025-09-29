import { HttpsError, onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { auth } from "firebase-admin";

initializeApp();
const adminAuth = auth();

export const checkWhitelist = onCall(async (req) => {
  return new Promise(async (resolve, reject) => {
    // TODO: Check if user email is somewhere in database, delete account if not
    const uid = await req.auth?.uid;
    if (!uid) {
      reject("Unauthenticated");
      throw new HttpsError("failed-precondition", "Unauthenticated");
    }

    await adminAuth.setCustomUserClaims(uid, { role: "ADMIN" });
    resolve(`User with uid ${uid} has been given ADMIN role`);
  });
});
