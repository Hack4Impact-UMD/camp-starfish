import { HttpsError, onCall } from "firebase-functions/https";
import { adminAuth, adminDb } from "../config/firebaseAdminConfig";
import { Collection } from "../data/firestore/utils";
import { UserRole } from "@/types/personTypes";

const checkWhitelist = onCall(async (req) => {
  // Validate authentication
  const uid = req.auth?.uid;
  if (!uid) {
    throw new HttpsError("failed-precondition", "Unauthenticated");
  }

  // Get user email from Firebase Auth
  let authUser;
  try {
    authUser = await adminAuth.getUser(uid);
  } catch (error) {
    throw new HttpsError("internal", "Failed to retrieve user information");
  }

  const email = authUser.email;
  if (!email) {
    // Delete account if no email
    try {
      await adminAuth.deleteUser(uid);
    } catch (deleteError) {
      // Log error but continue
      console.error("Failed to delete user account:", deleteError);
    }
    throw new HttpsError("failed-precondition", "User has no email address");
  }

  // Define collections to check with their corresponding roles
  const collectionsToCheck: Array<{ collection: string; role: UserRole }> = [
    { collection: Collection.PARENTS, role: "PARENT" },
    { collection: Collection.PHOTOGRAPHERS, role: "PHOTOGRAPHER" },
    { collection: Collection.STAFF, role: "STAFF" },
    { collection: Collection.ADMINS, role: "ADMIN" },
  ];

  // Search each collection for a user with matching email
  for (const { collection, role } of collectionsToCheck) {
    try {
      const querySnapshot = await adminDb
        .collection(collection)
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        // Extract campminderId from document ID (converted to number)
        const campminderId = Number(doc.id);

        // Validate that campminderId is a valid number
        if (isNaN(campminderId)) {
          console.error(`Invalid campminderId for document ${doc.id} in collection ${collection}`);
          continue;
        }

        // Set custom claims with role and campminderId
        await adminAuth.setCustomUserClaims(uid, {
          role,
          campminderId,
        });

        return {
          message: `User with email ${email} has been assigned ${role} role`,
          role,
          campminderId,
        };
      }
    } catch (queryError) {
      // Log error but continue checking other collections
      console.error(`Error querying collection ${collection}:`, queryError);
      continue;
    }
  }

  // No matching user found in any collection - delete Auth account
  try {
    await adminAuth.deleteUser(uid);
  } catch (deleteError) {
    console.error("Failed to delete user account:", deleteError);
    throw new HttpsError("internal", "Failed to process unauthorized user");
  }

  throw new HttpsError(
    "permission-denied",
    "User not found in whitelist. Account has been deleted."
  );
});

export const accountManagementCloudFunctions = {
  checkWhitelist,
};