import { CallableRequest, HttpsError, onCall } from "firebase-functions/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { z } from "zod";
import { adminAuth } from "../config/firebaseAdminConfig";
import { getUserDocByEmail, getUserDocById, deleteUserDoc, updateUserDoc } from "../data/firestore/users";
import { CustomClaims } from "@/auth/types/clientAuthTypes";
import { isAdmin } from "@/types/users/userTypeGuards";

const checkAllowlist = beforeUserCreated(async (event) => {
  if (!event.data) {
    throw new HttpsError("invalid-argument", "Missing user data");
  }

  const email = event.data.email;
  if (!email) {
    throw new HttpsError("failed-precondition", "User has no email address");
  }

  try {
    const user = await getUserDocByEmail(email);
    if (user.uid) {
      throw new HttpsError("failed-precondition", "User already has an account");
    }

    const customClaims: CustomClaims = (user.role === "ADMIN" ?
      {
        role: "ADMIN",
        campminderId: user.id,
        isSuperAdmin: false
      } : {
        role: user.role,
        campminderId: user.id
      }) satisfies CustomClaims
    const uid = event.data.uid;
    await adminAuth.setCustomUserClaims(uid, customClaims);
    await updateUserDoc(user.id, { uid });
    
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

const UserIdSchema = z.object({ userId: z.number() });

function isAuthUserNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "auth/user-not-found"
  );
}

// Deletes a user's Firebase Auth account (so access is actually revoked) and then their
// Firestore user record. Callable rather than a Firestore trigger so the admin UI gets
// synchronous success/error feedback and the action is gated on the caller being an admin.
const deleteUserAccount = onCall(async (req: CallableRequest<unknown>) => {
  if (!req.auth || req.auth.token.role !== "ADMIN") {
    throw new HttpsError("permission-denied", "Only admins can delete users.");
  }

  const result = UserIdSchema.safeParse(req.data);
  if (!result.success) {
    throw new HttpsError("invalid-argument", "Invalid payload: " + result.error.message);
  }
  const { userId } = result.data;
  if (req.auth.token.campminderId === userId) {
    throw new HttpsError("failed-precondition", "You cannot delete your own account.");
  }

  let user;
  try {
    user = await getUserDocById(userId);
    if (isAdmin(user) && user.isSuperAdmin) {
      throw new HttpsError("failed-precondition", "Super admin account cannot be deleted.");
    }
  } catch {
    throw new HttpsError("not-found", "User not found.");
  }

  // Revoke access first: delete the Auth account if one exists for this email. Some users
  // (e.g. campers without logins) may have no Auth account, which is fine.
  if ('email' in user && user.email) {
    try {
      const authUser = await adminAuth.getUserByEmail(user.email);
      await adminAuth.deleteUser(authUser.uid);
    } catch (error: unknown) {
      if (!isAuthUserNotFound(error)) {
        throw new HttpsError("internal", "Failed to delete the user's authentication account.");
      }
    }
  }

  try {
    await deleteUserDoc(userId);
  } catch {
    throw new HttpsError("internal", "Failed to delete the user record.");
  }
});

export const accountManagementCloudFunctions = {
  checkAllowlist,
  deleteUserAccount,
};