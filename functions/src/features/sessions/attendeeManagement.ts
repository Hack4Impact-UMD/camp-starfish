import { HttpsError, onCall } from "firebase-functions/https";
import { adminDb } from "../../config/firebaseAdminConfig";
import { batchGetUserDocs } from "../../data/firestore/users";
import { toRecord } from "@/utils/data/toRecord";
import { createAttendeeDoc } from "../../data/firestore/attendees";
import { ActivityPreferencesDoc, AdminAttendeeDoc, CamperAttendeeDoc, SectionScheduleDoc, StaffAttendeeDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, Timestamp, UpdateData } from "firebase-admin/firestore";
import { CreateAttendeesRequestSchema } from "@/hooks/attendees/types"
import { mapActivityPreferencesFromFirestore, updateActivityPreferencesDoc } from "../../data/firestore/activityPreferences";
import { SectionsSubcollection } from "@/data/firestore/types/collections";
import { mapSectionScheduleFromFirestore } from "../../data/firestore/sectionSchedules";
import { isBundleSectionSchedule } from "@/types/scheduling/schedulingTypeGuards";
import { ActivityPreferences, SectionSchedule } from "@/types/scheduling/schedulingTypes";

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
    const activityPreferences = ((await adminDb.collectionGroup(SectionsSubcollection.ACTIVITY_PREFERENCES).where('__name__', '>=', `/sessions/${sessionId}`).where('__name__', '<', `/sessions/${sessionId}\uf8ff`).get()).docs as DocumentSnapshot<ActivityPreferencesDoc>[]).map(mapActivityPreferencesFromFirestore);
    const sectionSchedules = ((await adminDb.collectionGroup(SectionsSubcollection.SCHEDULE).where('__name__', '>=', `/sessions/${sessionId}`).where('__name__', '<', `/sessions/${sessionId}\uf8ff`).get()).docs as DocumentSnapshot<SectionScheduleDoc>[]).map(mapSectionScheduleFromFirestore);
    const sectionData: { activityPreferences: ActivityPreferences, sectionSchedule: SectionSchedule }[] = [];
    for (const activityPrefs of activityPreferences) {
      sectionData.push({
        activityPreferences: activityPrefs,
        sectionSchedule: sectionSchedules.find(sectionSchedule => sectionSchedule.sectionId === activityPrefs.sectionId) as SectionSchedule
      })
    }
    
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
        } satisfies CamperAttendeeDoc, transaction);
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
        } satisfies StaffAttendeeDoc, transaction);
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
        } satisfies AdminAttendeeDoc, transaction);
      }
      return;
    }));

    await Promise.all(sectionData.map(section => {
      const { activityPreferences, sectionSchedule } = section;
      const updates: UpdateData<ActivityPreferencesDoc> = {};
      for (const blockId of Object.keys(activityPreferences.blocks)) {
        const activityIds =  isBundleSectionSchedule(sectionSchedule) ? sectionSchedule.blocks[blockId].activities.map(activity => activity.programAreaId) : sectionSchedule.blocks[blockId].activities.map(activity => activity.name);
        for (const attendee of attendees) {
          if (attendee.attendeeId in activityPreferences.blocks[blockId]) {
            continue;
          }
          for (const activityId of activityIds) {
            // @ts-ignore - TypeScript is being dumb
            updates[`blocks.${blockId}.${attendee.attendeeId}.${activityId}`] = Infinity;
          }
        }
      }
      return updateActivityPreferencesDoc(sessionId, activityPreferences.sectionId, updates, transaction);
    }));
  });
});