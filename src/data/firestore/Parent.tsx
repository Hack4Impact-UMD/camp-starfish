import { db } from "./firebase";
import { Parent, Camper } from "../../types/personTypes";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  where,
  getDocs,
  collection
} from "firebase/firestore";

const PARENTS_COLLECTION = "parents";
const CAMPERS_COLLECTION = "campers";

// Helper function to get parent reference by uid or campminderId
const getParentRefById = async (id: string | number, transaction: any) => {
  let parentRef = doc(db, PARENTS_COLLECTION, String(id));
  let parentDoc = await transaction.get(parentRef);

  if (!parentDoc.exists()) {
    // If not found by campminderId, try querying by uid
    const parentsCollection = collection(db, PARENTS_COLLECTION);
    const q = query(parentsCollection, where("ids.uid", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      parentRef = querySnapshot.docs[0].ref;
      parentDoc = querySnapshot.docs[0];
    } else {
      throw new Error("Parent not found.");
    }
  }
  
  return { parentRef, parentDoc };
};

export const getParentById = async (id: string | number) => {
  return await runTransaction(db, async (transaction) => {
    const { parentDoc } = await getParentRefById(id, transaction);
    return parentDoc.data() as Parent;
  });
};

export const createParent = async (parent: Parent) => {
  const parentId = parent.ids.uid ?? parent.ids.campminderId; // Use UID if available
  const parentRef = doc(db, PARENTS_COLLECTION, String(parentId));

  await runTransaction(db, async (transaction) => {
    const parentDoc = await transaction.get(parentRef);
    if (parentDoc.exists()) {
      throw new Error("Parent already exists.");
    }

    // Ensure all referenced camperIds exist
    for (const camperId of parent.camperIds) {
      const camperRef = doc(db, CAMPERS_COLLECTION, String(camperId));
      const camperDoc = await transaction.get(camperRef);
      if (!camperDoc.exists()) {
        throw new Error(`Camper with ID ${camperId} does not exist.`);
      }
    }

    transaction.set(parentRef, parent);
  });
};

export const updateParent = async (id: string | number, updates: Partial<Parent>) => {
  await runTransaction(db, async (transaction) => {
    const { parentRef, parentDoc } = await getParentRefById(id, transaction);
    
    // If updating camperIds, ensure the new camperIds exist
    if (updates.camperIds) {
      for (const camperId of updates.camperIds) {
        const camperRef = doc(db, CAMPERS_COLLECTION, String(camperId));
        const camperDoc = await transaction.get(camperRef);
        if (!camperDoc.exists()) {
          throw new Error(`Camper with ID ${camperId} does not exist.`);
        }
      }
    }

    transaction.update(parentRef, updates);
  });
};

export const deleteParent = async (id: string | number) => {
  await runTransaction(db, async (transaction) => {
    const { parentRef, parentDoc } = await getParentRefById(id, transaction);
    const parentData = parentDoc.data() as Parent;

    // Remove this parent from all referenced Campers
    for (const camperId of parentData.camperIds) {
      const camperRef = doc(db, CAMPERS_COLLECTION, String(camperId));
      const camperDoc = await transaction.get(camperRef);

      if (camperDoc.exists()) {
        const camperData = camperDoc.data() as Camper;
        const updatedParentIds = camperData.parentIds.filter(
          (p) => p.campminderId !== parentData.ids.campminderId
        );
        transaction.update(camperRef, { parentIds: updatedParentIds });
      }
    }

    transaction.delete(parentRef);
  });
};
