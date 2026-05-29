import { CallableRequest, HttpsError, onCall } from "firebase-functions/https";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { z } from "zod";
import { getUserByEmail, getUserById, deleteUser } from "../data/firestore/users";
import { adminAuth } from "../config/firebaseAdminConfig";

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
    user = await getUserById(userId);
  } catch {
    throw new HttpsError("not-found", "User not found.");
  }

  // Revoke access first: delete the Auth account if one exists for this email. Some users
  // (e.g. campers without logins) may have no Auth account, which is fine.
  if (user.email) {
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
    await deleteUser(userId);
  } catch {
    throw new HttpsError("internal", "Failed to delete the user record.");
  }
});

export const accountManagementCloudFunctions = {
  checkAllowlist,
  deleteUserAccount,
};