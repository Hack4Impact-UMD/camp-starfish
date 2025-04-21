import { db } from "@/config/firebase";
import { Parent } from "@/types/personTypes";
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
  WriteBatch,
} from "firebase/firestore";

const PARENTS_COLLECTION = "parents";

// Get a parent by campminderId or uid
export const getParentById = async (id: string | number, transaction?: Transaction): Promise<Parent> => {
  if (transaction) {
    if (typeof id === "string") {
      throw new Error("When using Transaction, id must be campminderId, not uid");
    }
    const parentRef = doc(db, PARENTS_COLLECTION, String(id));
    let parentDoc;
    try {
      parentDoc = await transaction.get(parentRef);
    } catch (error: any) {
      throw new Error(`Failed to get parent: ${error.code}`);
    }
    if (!parentDoc.exists()) {
      throw new Error("Parent not found");
    }
    return parentDoc.data() as Parent;
  }

  const parentsCollection = collection(db, PARENTS_COLLECTION);
  const q = query(
    parentsCollection,
    or(where("uid", "==", id), where("campminderId", "==", id))
  );
  let querySnapshot;
  try {
    querySnapshot = await getDocs(q);
  } catch (error: any) {
    throw new Error(`Failed to get parent: ${error.code}`);
  }
  if (querySnapshot.empty) {
    throw new Error("Parent not found");
  }
  return querySnapshot.docs[0].data() as Parent;
};

// Create a new parent
export const createParent = async (parent: Parent, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, String(parent.campminderId));
    // @ts-ignore
    await (instance ? instance.set(parentRef, parent) : setDoc(parentRef, parent));
  } catch (error: any) {
    throw new Error(`Failed to create parent: ${error.code}`);
  }
};

// Update a parent by campminderId
export const updateParent = async (id: number, updates: Partial<Parent>, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, String(id));
    // @ts-ignore
    await (instance ? instance.update(parentRef, updates) : updateDoc(parentRef, updates));
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Parent not found");
    }
    throw new Error(`Failed to update parent: ${error.code}`);
  }
};

// Delete a parent and remove the parent from all associated campers
export const deleteParent = async (id: number, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, PARENTS_COLLECTION, String(id));
    await (instance ? instance.delete(parentRef) : deleteDoc(parentRef));
  } catch (error: any) {
    throw new Error(`Failed to delete parent: ${error.code}`);
  }
};
