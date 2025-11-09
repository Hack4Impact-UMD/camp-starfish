import { useQuery } from "@tanstack/react-query";
import {
  getSectionById,
} from "@/data/firestore/sections";
import { getDoc, executeQuery } from "@/data/firestore/firestoreClientOperations";
import { db } from "@/config/firebase";
import {
  doc,
  collection,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  query,
} from "firebase/firestore";
import { Collection, SessionsSubcollection, SectionsSubcollection } from "@/data/firestore/utils";
import {
  SchedulingSectionID,
  SectionSchedule,
  SectionScheduleID,
  SchedulingSectionType,
  CamperAttendeeID,
  CamperAttendee,
  StaffAttendeeID,
  StaffAttendee,
  AdminAttendeeID,
  AdminAttendee,
} from "@/types/sessionTypes";

interface ActivityData {
  section: SchedulingSectionID;
  schedule: SectionScheduleID<SchedulingSectionType>;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

interface UseActivityDataProps {
  sessionId: string;
  sectionId: string;
  blockId: string;
  activityIndex: number;
}

// Firestore converters
const scheduleConverter: FirestoreDataConverter<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>> = {
  toFirestore: (schedule: WithFieldValue<SectionScheduleID<SchedulingSectionType>>): WithFieldValue<SectionSchedule<SchedulingSectionType>> => {
    const { id, sessionId, sectionId, ...dto } = schedule;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SectionSchedule<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>): SectionScheduleID<SchedulingSectionType> => ({
    id: snapshot.ref.id,
    sessionId: snapshot.ref.parent.parent!.parent!.parent!.id,
    sectionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data(),
  }),
};

const camperAttendeeConverter: FirestoreDataConverter<CamperAttendeeID, CamperAttendee> = {
  toFirestore: (attendee: WithFieldValue<CamperAttendeeID>): WithFieldValue<CamperAttendee> => {
    const { id, sessionId, ...dto } = attendee;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<CamperAttendee, CamperAttendee>): CamperAttendeeID => ({
    id: Number(snapshot.ref.id),
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data(),
  }),
};

const staffAttendeeConverter: FirestoreDataConverter<StaffAttendeeID, StaffAttendee> = {
  toFirestore: (attendee: WithFieldValue<StaffAttendeeID>): WithFieldValue<StaffAttendee> => {
    const { id, sessionId, ...dto } = attendee;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<StaffAttendee, StaffAttendee>): StaffAttendeeID => ({
    id: Number(snapshot.ref.id),
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data(),
  }),
};

const adminAttendeeConverter: FirestoreDataConverter<AdminAttendeeID, AdminAttendee> = {
  toFirestore: (attendee: WithFieldValue<AdminAttendeeID>): WithFieldValue<AdminAttendee> => {
    const { id, sessionId, ...dto } = attendee;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AdminAttendee, AdminAttendee>): AdminAttendeeID => ({
    id: Number(snapshot.ref.id),
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data(),
  }),
};

export function useActivityData({
  sessionId,
  sectionId,
  blockId,
  activityIndex,
}: UseActivityDataProps) {
  return useQuery<ActivityData>({
    queryKey: ["activity", sessionId, sectionId, blockId, activityIndex],
    queryFn: async () => {
      // Fetch section data
      const section = await getSectionById(sessionId, sectionId);
      
      // Only fetch schedule if it's a scheduling section
      if (section.type === 'COMMON') {
        throw new Error('Cannot fetch activity data for COMMON section type');
      }

      const schedulingSection = section as SchedulingSectionID;

      // Fetch schedule from sections/schedule subcollection
      const scheduleDoc = doc(
        db,
        Collection.SESSIONS,
        sessionId,
        SessionsSubcollection.SECTIONS,
        sectionId,
        SectionsSubcollection.SCHEDULE,
        SectionsSubcollection.SCHEDULE // The doc ID is the same as the collection name
      ) as DocumentReference<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>;
      
      const schedule = await getDoc<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>(
        scheduleDoc,
        scheduleConverter
      );

      // Fetch attendees from sessions/attendees subcollection
      const attendeesRef = collection(
        db,
        Collection.SESSIONS,
        sessionId,
        SessionsSubcollection.ATTENDEES
      );

      // Query all attendees - we'll filter by role
      const attendeesQuery = query(attendeesRef);
      
      // Query for each role type
      const [campers, staff, admins] = await Promise.all([
        executeQuery<CamperAttendeeID, CamperAttendee>(
          attendeesQuery as any,
          camperAttendeeConverter
        ),
        executeQuery<StaffAttendeeID, StaffAttendee>(
          attendeesQuery as any,
          staffAttendeeConverter
        ),
        executeQuery<AdminAttendeeID, AdminAttendee>(
          attendeesQuery as any,
          adminAttendeeConverter
        ),
      ]);

      return {
        section: schedulingSection,
        schedule,
        campers,
        staff,
        admins,
      };
    },
    enabled: !!sessionId && !!sectionId && !!blockId,
  });
}
