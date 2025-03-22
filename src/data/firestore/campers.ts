import { db } from "@/config/firebase";
import { Camper } from "@/types/personTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

const CAMPERS_COLLECTION = "campers";

export const getCamperById = async (campminderId: number): Promise<Camper> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  const camperDoc = await getDoc(camperRef);
  if (!camperDoc.exists()) {
    throw new Error("Camper not found");
  }
  return camperDoc.data() as Camper;
};

export const createCamper = async (camper: Camper): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(camper.campminderId));
  try {
    await setDoc(camperRef, camper);
  } catch (error: any) {
    throw Error("Camper already exists")
  }
};

export const updateCamper = async (campminderId: number, updates: Partial<Camper>): Promise<void> => {
  try {
    const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
    await updateDoc(camperRef, updates);
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Camper not found");
    }
  }
};

export const deleteCamper = async (campminderId: number): Promise<void> => {
  const camperRef = doc(db, CAMPERS_COLLECTION, String(campminderId));
  await deleteDoc(camperRef);
};
