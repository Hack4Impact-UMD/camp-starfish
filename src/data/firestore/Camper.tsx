import { db } from "./firebase";
import { Camper } from "../../types/personTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, runTransaction } from "firebase/firestore";

const CAMPERS_COLLECTION = "campers";

export const getCamperById = async (campminderId: number) => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));

  return await runTransaction(db, async (transaction) => {
    const camperDoc = await transaction.get(camperRef);
    if (!camperDoc.exists()) {
      throw new Error("Camper not found.");
    }
    return camperDoc.data() as Camper;
  });
};

export const createCamper = async (camper: Camper) => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(camper.campminderId));

  await runTransaction(db, async (transaction) => {
    const camperDoc = await transaction.get(camperRef);
    if (camperDoc.exists()) {
      throw new Error("Camper already exists.");
    }

    transaction.set(camperRef, camper);
  });
};

export const updateCamper = async (campminderId: number, updates: Partial<Camper>) => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));

  await runTransaction(db, async (transaction) => {
    const camperDoc = await transaction.get(camperRef);
    if (!camperDoc.exists()) {
      throw new Error("Camper not found.");
    }

    transaction.update(camperRef, updates);
  });
};

export const deleteCamper = async (campminderId: number) => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));

  await runTransaction(db, async (transaction) => {
    const camperDoc = await transaction.get(camperRef);
    if (!camperDoc.exists()) {
      throw new Error("Camper not found.");
    }

    transaction.delete(camperRef);
  });
};
