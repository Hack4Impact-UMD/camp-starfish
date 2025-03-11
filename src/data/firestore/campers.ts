import { db } from "../../config/firebase";
import { Camper } from "../../types/personTypes";
import { doc, Transaction } from "firebase/firestore";

const CAMPERS_COLLECTION = "campers";

export const getCamperById = async (transaction: Transaction, campminderId: number): Promise<Camper> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  const camperDoc = await transaction.get(camperRef);

  if (!camperDoc.exists()) {
    throw new Error("Camper not found.");
  }

  return camperDoc.data() as Camper;
};

export const createCamper = async (transaction: Transaction, camper: Camper): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(camper.campminderId));
  const camperDoc = await transaction.get(camperRef);

  if (camperDoc.exists()) {
    throw new Error("Camper already exists.");
  }

  transaction.set(camperRef, camper);
};

export const updateCamper = async (transaction: Transaction, campminderId: number, updates: Partial<Camper>): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  const camperDoc = await transaction.get(camperRef);

  if (!camperDoc.exists()) {
    throw new Error("Camper not found.");
  }

  transaction.update(camperRef, updates);
};

export const deleteCamper = async (transaction: Transaction, campminderId: number): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  const camperDoc = await transaction.get(camperRef);

  if (!camperDoc.exists()) {
    throw new Error("Camper not found.");
  }

  transaction.delete(camperRef);
};
