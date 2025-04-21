import { db } from "@/config/firebase";
import { Camper } from "@/types/personTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Transaction, WriteBatch } from "firebase/firestore";

const CAMPERS_COLLECTION = "campers";

export const getCamperById = async (campminderId: number, transaction?: Transaction): Promise<Camper> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  const camperDoc = await (transaction ? transaction.get(camperRef) : getDoc(camperRef));
  if (!camperDoc.exists()) {
    throw new Error("Camper not found");
  }
  return camperDoc.data() as Camper;
};

export const createCamper = async (camper: Camper, instance?: Transaction | WriteBatch): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(camper.campminderId));
  // @ts-ignore
  await (instance ? instance.set(camperRef, camper) : setDoc(camperRef, camper));
};

export const updateCamper = async (campminderId: number, updates: Partial<Camper>, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
    // @ts-ignore
    await (instance ? instance.update(camperRef, updates) : updateDoc(camperRef, updates));
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Camper not found");
    }
    throw error;
  }
};

export const deleteCamper = async (campminderId: number, instance?: Transaction | WriteBatch): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  await (instance ? instance.delete(camperRef) : deleteDoc(camperRef));
};
