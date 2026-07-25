import { adminDb } from "../../config/firebaseAdminConfig";
import { AdminAttendee, Attendee, CamperAttendee, StaffAttendee } from "@/types/sessions/sessionTypes";
import { AttendeeDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData
} from "firebase-admin/firestore";
import { setDoc, getDoc, updateDoc, executeQuery, deleteDoc, FirestoreQueryOptions, batchGetDocs } from "./firestoreAdminOperations";
import { RootLevelCollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<AttendeeDoc, AttendeeDoc> | QueryDocumentSnapshot<AttendeeDoc, AttendeeDoc>): Attendee {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const attendeeDoc = snapshot.data() as AttendeeDoc;
  switch (attendeeDoc.role) {
    case "ADMIN":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "ADMIN",
        snapshot: {
          dateOfBirth: moment(attendeeDoc.snapshot.dateOfBirth.toDate()),
          gender: attendeeDoc.snapshot.gender,
          name: attendeeDoc.snapshot.name,
          nonoList: attendeeDoc.snapshot.nonoList,
          yesyesList: attendeeDoc.snapshot.yesyesList
        }
      } satisfies AdminAttendee;
    case "STAFF":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "STAFF",
        snapshot: {
          dateOfBirth: moment(attendeeDoc.snapshot.dateOfBirth.toDate()),
          gender: attendeeDoc.snapshot.gender,
          name: attendeeDoc.snapshot.name,
          nonoList: attendeeDoc.snapshot.nonoList,
          yesyesList: attendeeDoc.snapshot.yesyesList
        },
        bunk: attendeeDoc.bunk,
        isLeadBunkCounselor: attendeeDoc.isLeadBunkCounselor,
        programCounselorFor: attendeeDoc.programCounselorFor
      } satisfies StaffAttendee;
    case "CAMPER":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "CAMPER",
        snapshot: {
          dateOfBirth: moment(attendeeDoc.snapshot.dateOfBirth.toDate()),
          gender: attendeeDoc.snapshot.gender,
          name: attendeeDoc.snapshot.name,
          nonoList: attendeeDoc.snapshot.nonoList,
        },
        ageGroup: attendeeDoc.ageGroup,
        bunk: attendeeDoc.bunk,
        isOptedOutFromSwim: attendeeDoc.isOptedOutFromSwim,
        level: attendeeDoc.level
      } satisfies CamperAttendee;
    default: throw Error("Unknown attendee role");
  }
}

function getAttendeeDocRef(sessionId: string, attendeeId: number) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.ATTENDEES).doc(String(attendeeId)) as DocumentReference<AttendeeDoc, AttendeeDoc>;
}

function getAttendeeCollectionRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.ATTENDEES) as CollectionReference<AttendeeDoc, AttendeeDoc>;
}

export async function getAttendeeDoc(attendeeId: number, sessionId: string, transaction?: Transaction): Promise<Attendee> {
  const snapshot = await getDoc<AttendeeDoc>(getAttendeeDocRef(sessionId, attendeeId), transaction);
  return fromFirestore(snapshot);
};

export async function listAttendeeDocs(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<AttendeeDoc> = {}, transaction?: Transaction): Promise<Attendee[]> {
  const snapshots = await executeQuery<AttendeeDoc>(getAttendeeCollectionRef(sessionId), { queryOptions: firestoreQueryOptions, transaction });
  return snapshots.map(fromFirestore);
}

export async function batchGetAttendeeDocs(sessionId: string, attendeeIds: number[], transaction?: Transaction): Promise<Attendee[]> {
  const snapshots = await batchGetDocs<AttendeeDoc>(getAttendeeCollectionRef(sessionId), attendeeIds.map(id => String(id)), transaction);
  return snapshots.map(fromFirestore);
}

export async function createAttendeeDoc(attendeeId: number, sessionId: string, attendee: WithFieldValue<AttendeeDoc>, instance?: Transaction | WriteBatch): Promise<number> {
  await setDoc<AttendeeDoc>(getAttendeeDocRef(sessionId, attendeeId), attendee, { instance });
  return attendeeId;
}

export async function updateAttendeeDoc(attendeeId: number, sessionId: string, updates: UpdateData<AttendeeDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AttendeeDoc>(getAttendeeDocRef(sessionId, attendeeId), updates, instance);
}

export async function deleteAttendeeDoc(attendeeId: number, sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AttendeeDoc>(getAttendeeDocRef(sessionId, attendeeId), instance);
}