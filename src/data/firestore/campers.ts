import { db } from "@/config/firebase";
import { Camper, CamperID } from "@/types/personTypes";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, FirestoreDataConverter, WithFieldValue, DocumentReference } from "firebase/firestore";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { Collection } from "./utils";

const camperFirestoreConverter: FirestoreDataConverter<CamperID, Camper> = {
  toFirestore: (camper: WithFieldValue<CamperID>): WithFieldValue<Camper> => {
    const { id, role, ...dto } = camper;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Camper, Camper>): CamperID => ({ id: Number(snapshot.ref.id), role: "CAMPER", ...snapshot.data() })
};

export async function getCamperById(campminderId: number, transaction?: Transaction): Promise<Camper> {
  return await getDoc<CamperID, Camper>(doc(db, Collection.CAMPERS, String(campminderId)) as DocumentReference<CamperID, Camper>, camperFirestoreConverter, transaction);
};

export async function setCamper(camper: CamperID, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<CamperID, Camper>(doc(db, Collection.CAMPERS, String(camper.id)) as DocumentReference<CamperID, Camper>, camper, camperFirestoreConverter, instance);
};

export async function updateCamper(campminderId: number, updates: Partial<Camper>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<CamperID, Camper>(doc(db, Collection.CAMPERS, String(campminderId)) as DocumentReference<CamperID, Camper>, updates, camperFirestoreConverter, instance);
};

export async function deleteCamper(campminderId: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<CamperID, Camper>(doc(db, Collection.CAMPERS, String(campminderId)) as DocumentReference<CamperID, Camper>, camperFirestoreConverter, instance);
};
