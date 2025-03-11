/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin";

const admin = initializeApp();

export const checkWhitelist = onCall(async (req, res) => {
  return new Promise(async (resolve, reject) => {
    // TODO: Check if user email is somewhere in database, delete account if not
    const uid = await req.auth?.uid;
    if (!uid) {
      reject("Unauthenticated");
      throw new HttpsError("failed-precondition", "Unauthenticated");
    }

    await admin.auth().setCustomUserClaims(uid, { role: "ADMIN" });
    resolve(`User with uid ${uid} has been given ADMIN role`);
  });
});
