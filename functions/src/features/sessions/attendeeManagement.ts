import { HttpsError, onCall } from "firebase-functions/https";
import { adminDb } from "../../config/firebaseAdminConfig";
import { batchGetUserDocs } from "../../data/firestore/users";
import { toRecord } from "@/utils/data/toRecord";
import { createAttendeeDoc } from "../../data/firestore/attendees";
import { ActivityPreferencesDoc, AdminAttendeeDoc, CamperAttendeeDoc, DaysOffScheduleDoc, SectionScheduleDoc, StaffAttendeeDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, FieldValue, Timestamp, Transaction, UpdateData } from "firebase-admin/firestore";
import { CreateAdminAttendeeRequest, CreateAttendeeRequest, CreateAttendeesRequestSchema, CreateCamperAttendeeRequest, CreateStaffAttendeeRequest } from "@/hooks/attendees/types"
import { mapActivityPreferencesFromFirestore, updateActivityPreferencesDoc } from "../../data/firestore/activityPreferences";
import { SectionsSubcollection } from "@/data/firestore/types/collections";
import { mapSectionScheduleFromFirestore } from "../../data/firestore/sectionSchedules";
import { isBundleSectionSchedule, isBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypeGuards";
import { ActivityPreferences, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { updateSessionDoc } from "../../data/firestore/sessions";
import { uniqueArray } from "@/utils/data/unique";
import { User } from "@/types/users/userTypes";
import { updateDaysOffScheduleDoc } from "../../data/firestore/daysOffSchedules";

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
  await adminDb.runTransaction(async (transaction) => {
    const users = await batchGetUserDocs(attendees.map(attendee => attendee.attendeeId), transaction);
    const activityPreferences = ((await transaction.get(adminDb.collectionGroup(SectionsSubcollection.ACTIVITY_PREFERENCES).where('__name__', '>=', `/sessions/${sessionId}`).where('__name__', '<', `/sessions/${sessionId}\uf8ff`))).docs as DocumentSnapshot<ActivityPreferencesDoc>[]).map(mapActivityPreferencesFromFirestore);
    const sectionSchedules = ((await transaction.get(adminDb.collectionGroup(SectionsSubcollection.SCHEDULE).where('__name__', '>=', `/sessions/${sessionId}`).where('__name__', '<', `/sessions/${sessionId}\uf8ff`))).docs as DocumentSnapshot<SectionScheduleDoc>[]).map(mapSectionScheduleFromFirestore);
    const sectionData: { activityPreferences: ActivityPreferences, sectionSchedule: SectionSchedule }[] = [];
    for (const activityPrefs of activityPreferences) {
      sectionData.push({
        activityPreferences: activityPrefs,
        sectionSchedule: sectionSchedules.find(sectionSchedule => sectionSchedule.sectionId === activityPrefs.sectionId) as SectionSchedule
      })
    }

    const usersById = toRecord(users, user => user.id);
    const acceptedAttendees = attendees.filter(attendee => attendee.attendeeId in usersById && usersById[attendee.attendeeId].role === attendee.role);

    await Promise.all([
      ...createAttendeeDocs(acceptedAttendees, usersById, sessionId, transaction),
      ...addCamperAttendeesToSectionSchedules(sectionData, acceptedAttendees, sessionId, transaction),
      updateSessionDocWithAttendeeIds(acceptedAttendees, sessionId, transaction),
    ])
  });
});

function createAttendeeDocs(attendeeRequests: CreateAttendeeRequest[], usersById: Record<number, User>, sessionId: string, transaction: Transaction) {
  return attendeeRequests.map(attendeeRequest => {
    const user = usersById[attendeeRequest.attendeeId];
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
  });
}

function addCamperAttendeesToSectionSchedules(sectionData: { activityPreferences: ActivityPreferences, sectionSchedule: SectionSchedule }[], attendeeRequests: CreateCamperAttendeeRequest[], sessionId: string, transaction: Transaction) {
  return sectionData.map(section => {
    const { activityPreferences, sectionSchedule } = section;
    const updates: UpdateData<ActivityPreferencesDoc> = {};
    const camperOrBunkIds = isBunkJamboreeSectionSchedule(sectionSchedule) ? uniqueArray(attendeeRequests.filter(attendee => attendee.role !== "ADMIN").map(attendee => attendee.bunk)) : attendeeRequests.filter(attendee => attendee.role === "CAMPER").map(attendee => attendee.attendeeId);
    for (const blockId of Object.keys(activityPreferences.blocks)) {
      const activityIds = isBundleSectionSchedule(sectionSchedule) ? sectionSchedule.blocks[blockId].activities.map(activity => activity.programAreaId) : sectionSchedule.blocks[blockId].activities.map(activity => activity.name);
      for (const camperOrBunkId of camperOrBunkIds) {
        if (camperOrBunkId in activityPreferences.blocks[blockId]) {
          continue;
        }
        for (const activityId of activityIds) {
          // @ts-ignore - TypeScript is being dumb
          updates[`blocks.${blockId}.${camperOrBunkId}.${activityId}`] = Infinity;
        }
      }
    }
    if (Object.keys(updates).length === 0) return;
    return updateActivityPreferencesDoc(sessionId, activityPreferences.sectionId, updates, transaction);
  });
}

function updateSessionDocWithAttendeeIds(attendeeRequests: CreateAttendeeRequest[], sessionId: string, transaction: Transaction) {
  return updateSessionDoc(sessionId, { attendeeIds: FieldValue.arrayUnion(...attendeeRequests.map(attendee => attendee.attendeeId)) }, transaction);
}

function addEmployeesToDaysOffSchedule(attendeeRequests: (CreateStaffAttendeeRequest | CreateAdminAttendeeRequest)[], sessionId: string, transaction: Transaction) {
  return updateDaysOffScheduleDoc(sessionId, attendeeRequests.reduce((acc, attendeeRequest) => ({ ...acc, [`daysOffByCounselorId.${attendeeRequest.attendeeId}`]: [] }), {} as UpdateData<DaysOffScheduleDoc>), transaction);
}