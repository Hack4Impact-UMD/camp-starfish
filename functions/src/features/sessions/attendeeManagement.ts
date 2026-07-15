import { HttpsError, onCall } from "firebase-functions/https";
import { adminDb } from "../../config/firebaseAdminConfig";
import { batchGetUserDocs } from "../../data/firestore/users";
import { toRecord } from "@/utils/data/toRecord";
import { createAttendeeDoc } from "../../data/firestore/attendees";
import { AdminAttendeeDoc, CamperAttendeeDoc, StaffAttendeeDoc } from "@/data/firestore/types/documents";
import { Timestamp } from "firebase-admin/firestore";
import { CreateAttendeesRequestSchema } from "@/hooks/attendees/useCreateAttendees"

export const createAttendees = onCall(async (req) => {
  if (!req.auth || !req.auth.token.role) {
    throw new HttpsError("unauthenticated", "You are not signed in.");
  } else if (req.auth?.token.role !== "ADMIN") {
    throw new HttpsError("permission-denied", "You do not have permission to perform this action.");
  }

  const requestValidationResult = CreateAttendeesRequestSchema.safeParse(req.data);
  if (!requestValidationResult.success) {
    throw new HttpsError("invalid-argument", "Invalid Request");
  }

  const { sessionId, attendees } = requestValidationResult.data;
  const attendeeRequestsById = toRecord(attendees, attendee => attendee.attendeeId);
  await adminDb.runTransaction(async (transaction) => {
    const users = await batchGetUserDocs(attendees.map(attendee => attendee.attendeeId), transaction);
    await Promise.all(users.map(user => {
      const attendeeRequest = attendeeRequestsById[user.id];
      if (user.role === "CAMPER" && attendeeRequest.role === "CAMPER") {
        return createAttendeeDoc(user.id, sessionId, {
          ageGroup: attendeeRequest.ageGroup,
          bunk: attendeeRequest.bunk,
          isOptedOutFromSwim: false,
          level: 1,
          role: "CAMPER",
          snapshot: {
            // @ts-expect-error - Timestamp class in Firestore client & admin SDKs are slightly different, doesn't affect functionality
            dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
            gender: user.gender,
            name: user.name,
            nonoList: user.nonoListIds
          }
        } satisfies CamperAttendeeDoc)
      } else if (user.role === "STAFF" && attendeeRequest.role === "STAFF") {
        return createAttendeeDoc(user.id, sessionId, {
          bunk: attendeeRequest.bunk,
          isLeadBunkCounselor: attendeeRequest.isLeadBunkCounselor,
          role: "STAFF",
          snapshot: {
            // @ts-expect-error - Timestamp class in Firestore client & admin SDKs are slightly different, doesn't affect functionality
            dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
            gender: user.gender,
            name: user.name,
            nonoList: user.nonoListIds,
            yesyesList: user.yesyesListIds
          }
        } satisfies StaffAttendeeDoc)
      } else if (user.role === "ADMIN" && attendeeRequest.role === "ADMIN") {
        return createAttendeeDoc(user.id, sessionId, {
          role: "ADMIN",
          snapshot: {
            // @ts-expect-error - Timestamp class in Firestore client & admin SDKs are slightly different, doesn't affect functionality
            dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
            gender: user.gender,
            name: user.name,
            nonoList: user.nonoListIds,
            yesyesList: user.yesyesListIds
          }
        } satisfies AdminAttendeeDoc);
      }
      return;
    }))
  });
});