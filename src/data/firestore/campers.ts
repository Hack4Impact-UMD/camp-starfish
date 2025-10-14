import { db } from "@/config/firebase";
import { Camper, CamperID } from "@/types/personTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Transaction, WriteBatch, FirestoreError } from "firebase/firestore";
import { Collection } from "./utils";

export const getCamperById = async (campminderId: number, transaction?: Transaction): Promise<Camper> => {
  const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
  let camperDoc;
  try {
    camperDoc = await (transaction ? transaction.get(camperRef) : getDoc(camperRef));
  } catch {
    throw new Error(`Failed to get camper`);
  }
  if (!camperDoc.exists()) {
    throw new Error("Camper not found");
  }
  return camperDoc.data() as Camper;
};

export const createCamper = async (camper: CamperID, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(camper.id));
    // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
    await (instance ? instance.set(camperRef, camper) : setDoc(camperRef, camper));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "already-exists") {
      throw new Error("Camper already exists");
    }
    throw new Error(`Failed to create camper`);
  }
};

export const updateCamper = async (campminderId: number, updates: Partial<Camper>, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
    // @ts-expect-error - instance.update on both Transaction and WriteBatch have the same signature
    await (instance ? instance.update(camperRef, updates) : updateDoc(camperRef, updates));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "not-found") {
      throw new Error("Camper not found");
    }
    throw new Error(`Failed to update camper`);
  }
};

export const deleteCamper = async (campminderId: number, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
    await (instance ? instance.delete(camperRef) : deleteDoc(camperRef));
  } catch {
    throw new Error(`Failed to delete camper`);
  }
};
