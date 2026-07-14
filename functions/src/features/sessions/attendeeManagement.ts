import { HttpsError, onCall } from "firebase-functions/https";
import { adminDb } from "../../config/firebaseAdminConfig";
import { batchGetUserDocs } from "../../data/firestore/users";
import { toRecord } from "@/utils/data/toRecord";
import { createAttendeeDoc } from "../../data/firestore/attendees";
import { AdminAttendeeDoc, CamperAttendeeDoc, StaffAttendeeDoc } from "@/data/firestore/types/documents";
import { Timestamp } from "firebase-admin/firestore";

export const createAttendees = onCall(async (req) => {
  if (!req.auth || !req.auth.token.role) {
    throw new HttpsError("unauthenticated", "You are not signed in.");
  } else if (req.auth?.token.role !== "ADMIN") {
    throw new HttpsError("permission-denied", "You do not have permission to perform this action.");
  }

  const { sessionId, attendeeRequests } = req.data;
  const attendeeRequestsById = toRecord(attendeeRequests, attendeeRequest => attendeeRequest.attendeeId);
  await adminDb.runTransaction(async (transaction) => {
    const users = await batchGetUserDocs(attendees.map(attendee => attendee.attendeeId), transaction);
    await Promise.all(users.map(user => {
      switch (user.role) {
        case "CAMPER":
          return createAttendeeDoc(user.id, sessionId, {
            ageGroup: attendeeRequestsById[user.id].ageGroup,
            bunk: attendeeRequestsById[user.id].bunk,
            isOptedOutFromSwim: false,
            level: 1,
            role: "CAMPER",
            snapshot: {
              dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
              gender: user.gender,
              name: user.name,
              nonoList: user.nonoListIds
            }
          } satisfies CamperAttendeeDoc)
        case "STAFF":
          return createAttendeeDoc(user.id, sessionId, {
            bunk: attendeeRequestsById[user.id].bunk,
            isLeadBunkCounselor: attendeeRequestsById[user.id].isLeadBunkCounselor,
            role: "STAFF",
            snapshot: {
              dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
              gender: user.gender,
              name: user.name,
              nonoList: user.nonoListIds,
              yesyesList: user.yesyesListIds
            }
          } satisfies StaffAttendeeDoc)
        case "ADMIN":
          return createAttendeeDoc(user.id, sessionId, {
            role: "ADMIN",
            snapshot: {
              dateOfBirth: Timestamp.fromDate(user.dateOfBirth.toDate()),
              gender: user.gender,
              name: user.name,
              nonoList: user.nonoListIds,
              yesyesList: user.yesyesListIds
            }
          } satisfies AdminAttendeeDoc);
      }
    }))
  });
});