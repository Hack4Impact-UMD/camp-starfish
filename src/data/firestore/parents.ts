import { db } from "@/config/firebase";
import { Parent, Camper } from "@/types/personTypes";
import {
  doc,
  query,
  where,
  getDocs,
  collection,
  Transaction,
  or,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getCamperById } from "./campers";

const PARENTS_COLLECTION = "parents";
const CAMPERS_COLLECTION = "campers";

// Get a parent by campminderId or uid
export const getParentById = async (id: string | number): Promise<Parent> => {
  const parentsCollection = collection(db, PARENTS_COLLECTION);

  // Using Firestore's `or()` to query for either condition
  const q = query(
    parentsCollection,
    or(where("uid", "==", id), where("campminderId", "==", id))
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error("Parent not found");
  }

  return querySnapshot.docs[0].data() as Parent;
};

// Create a new parent
export const createParent = async (parent: Parent): Promise<void> => {
  const parentId = parent.campminderId;
  const parentRef = doc(db, PARENTS_COLLECTION, String(parentId));

  // Ensure all referenced camperIds exist
  for (const camperId of parent.camperIds) {
    try {
      await getCamperById(camperId);
    } catch (error: any) {
      throw new Error("Parent has invalid camperIds")
    }
  }

  try {
    await setDoc(parentRef, parent);
  } catch (error: any) {
    throw Error("Parent already exists");
  }
};

// Update a parent by campminderId
export const updateParent = async (id: number, updates: Partial<Parent>): Promise<void> => {
  // If updating camperIds, ensure the new camperIds exist
  if (updates.camperIds) {
    for (const camperId of updates.camperIds) {
      try {
        await getCamperById(camperId);
      } catch (error: any) {
        throw new Error("Parent has invalid camperIds")
      }
    }
  }

  const parentRef = doc(db, PARENTS_COLLECTION, String(id));
  try {
    await updateDoc(parentRef, updates);
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Parent not found");
    }
  }
};

// Delete a parent and remove the parent from all associated campers
export const deleteParent = async (id: number): Promise<void> => {
  const parentRef = doc(db, PARENTS_COLLECTION, String(id));
  await deleteDoc(parentRef);
  
  // TODO: Remove parent from all referenced campers in cloud function
  //const parentDoc = await getParentById(transaction, id);
  //const parentData = parentDoc as Parent;
//
  //// Remove this parent from all referenced Campers
  //for (const camperId of parentData.camperIds) {
  //  const camperRef = doc(db, CAMPERS_COLLECTION, String(camperId));
  //  const camperDoc = await transaction.get(camperRef);
//
  //  if (camperDoc.exists()) {
  //    const camperData = camperDoc.data() as Camper;
  //    const updatedParentIds = camperData.parentIds.filter(
  //      (p) => p.campminderId !== parentData.ids.campminderId
  //    );
  //    transaction.update(camperRef, { parentIds: updatedParentIds });
  //  }
  //}
//
  //transaction.delete(doc(db, PARENTS_COLLECTION, String(id)));
};
