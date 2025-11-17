import { db } from "@/config/firebase";
import {
  CommonSectionID,
  SchedulingSectionID,
  SectionID,
} from "@/types/sessionTypes";
import {
  doc,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
} from "firebase/firestore";
import { getDoc } from "./firestoreClientOperations";

type SectionDTO =
  | Omit<CommonSectionID, "id">
  | Omit<SchedulingSectionID, "id">;

const SECTIONS_COLLECTION = "sections";

const sectionFirestoreConverter: FirestoreDataConverter<SectionID, SectionDTO> =
  {
    toFirestore: (section: WithFieldValue<SectionID>): WithFieldValue<SectionDTO> => {
      const { id, ...dto } = section;
      return dto;
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<SectionDTO, SectionDTO>
    ): SectionID => ({
      id: snapshot.ref.id,
      ...snapshot.data(),
    }),
  };

export async function getSectionById(id: string): Promise<SectionID> {
  return getDoc<SectionID, SectionDTO>(
    doc(db, SECTIONS_COLLECTION, id) as DocumentReference<
      SectionID,
      SectionDTO
    >,
    sectionFirestoreConverter
  );
}

