import { db } from "@/config/firebase";
import { Camper } from "@/types/personTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Transaction, WriteBatch } from "firebase/firestore";
import { Collection } from "./utils";

export const getCamperById = async (campminderId: number, transaction?: Transaction): Promise<Camper> => {
  const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
  let camperDoc;
  try {
    camperDoc = await (transaction ? transaction.get(camperRef) : getDoc(camperRef));
  } catch (error: any) {
    throw new Error(`Failed to get camper: ${error.code}`);
  }
  if (!camperDoc.exists()) {
    throw new Error("Camper not found");
  }
  return camperDoc.data() as Camper;  
};

export const createCamper = async (camper: Camper, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(camper.campminderId));
    // @ts-ignore
    await (instance ? instance.set(camperRef, camper) : setDoc(camperRef, camper));  
  } catch (error: any) {
    throw new Error(`Failed to create camper: ${error.code}`);
  }
};

export const updateCamper = async (campminderId: number, updates: Partial<Camper>, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
    // @ts-ignore
    await (instance ? instance.update(camperRef, updates) : updateDoc(camperRef, updates));
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Camper not found");
    }
    throw new Error(`Failed to update camper: ${error.code}`);
  }
};

export const deleteCamper = async (campminderId: number, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const camperRef = doc(db, Collection.CAMPERS, String(campminderId));
    await (instance ? instance.delete(camperRef) : deleteDoc(camperRef));  
  } catch (error: any) {
    throw new Error(`Failed to delete camper: ${error.code}`);
  }
};
