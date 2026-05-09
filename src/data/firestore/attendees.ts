import { db } from "@/config/firebase";
import { AdminAttendee, Attendee, CamperAttendee, StaffAttendee } from "@/types/sessions/sessionTypes";
import { AttendeeDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  collection,
  CollectionReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<AttendeeDoc, AttendeeDoc> | QueryDocumentSnapshot<AttendeeDoc, AttendeeDoc>): Attendee {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const attendeeDoc = snapshot.data();
  switch (attendeeDoc.role) {
    case "ADMIN":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "ADMIN",
        daysOff: attendeeDoc.daysOff.map(timestamp => moment(timestamp.toDate())),
        snapshot: attendeeDoc.snapshot
      } satisfies AdminAttendee;
    case "STAFF":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "STAFF",
        daysOff: attendeeDoc.daysOff.map(timestamp => moment(timestamp.toDate())),
        snapshot: attendeeDoc.snapshot,
        bunk: attendeeDoc.bunk,
        isLeadBunkCounselor: attendeeDoc.isLeadBunkCounselor,
        programCounselorFor: attendeeDoc.programCounselorFor
      } satisfies StaffAttendee;
    case "CAMPER":
      return {
        attendeeId: Number(snapshot.ref.id),
        sessionId: snapshot.ref.parent.parent!.id,
        role: "CAMPER",
        snapshot: attendeeDoc.snapshot,
        ageGroup: attendeeDoc.ageGroup,
        bunk: attendeeDoc.bunk,
        isOptedOutFromSwim: attendeeDoc.isOptedOutFromSwim,
        level: attendeeDoc.level
      } satisfies CamperAttendee;
    default: throw Error("Unknown attendee role");
  }
}

export async function getAttendeeById(campminderId: number, sessionId: string, transaction?: Transaction): Promise<Attendee> {
  const snapshot = await getDoc<AttendeeDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeDoc, AttendeeDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function getAttendeesBySessionId(sessionId: string): Promise<Attendee[]> {
  const snapshots = await executeQuery<AttendeeDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES) as CollectionReference<AttendeeDoc, AttendeeDoc>);
  return snapshots.map(fromFirestore);
}

export async function createAttendee(campminderId: number, sessionId: string, attendee: WithFieldValue<AttendeeDoc>, instance?: Transaction | WriteBatch): Promise<number> {
  const attendeeId = campminderId;
  await setDoc<AttendeeDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeDoc, AttendeeDoc>, attendee, { instance });
  return attendeeId;
}

export async function updateAttendee(campminderId: number, sessionId: string, updates: UpdateData<AttendeeDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AttendeeDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeDoc, AttendeeDoc>, updates, instance);
}