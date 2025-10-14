import { db } from "@/config/firebase";
import { Parent, ParentID } from "@/types/personTypes";
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
  FirestoreError,
  limit,
} from "firebase/firestore";
import { Collection } from "./utils";

// Get a parent by campminderId or uid
export const getParentById = async (id: string | number, transaction?: Transaction): Promise<Parent> => {
  if (transaction) {
    if (typeof id === "string") {
      throw new Error("When using Transaction, id must be campminderId, not uid");
    }
    const parentRef = doc(db, Collection.PARENTS, String(id));

    let parentDoc;
    try {
      parentDoc = await transaction.get(parentRef);
    } catch (error: unknown) {
      if (error instanceof FirestoreError && error.code === "not-found") {
        throw new Error("Parent doesn't exist");
      }
      throw new Error(`Failed to get parent`);
    }
    if (!parentDoc.exists()) {
      throw new Error("Parent not found");
    }
    return parentDoc.data() as Parent;
  }

  const parentsCollection = collection(db, Collection.PARENTS);
  const q = query(
    parentsCollection,
    or(where("uid", "==", id), where("campminderId", "==", id)),
    limit(1)
  );
  let querySnapshot;
  try {
    querySnapshot = await getDocs(q);
  } catch {
    throw new Error(`Failed to get parent`);
  }
  if (querySnapshot.empty) {
    throw new Error("Parent not found");
  }
  return querySnapshot.docs[0].data() as Parent;
};

// Create a new parent
export const createParent = async (parent: ParentID, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, Collection.PARENTS, String(parent.id));
    // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
    await (instance ? instance.set(parentRef, parent) : setDoc(parentRef, parent));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "already-exists") {
      throw new Error("Parent already exists");
    }
    throw new Error(`Failed to create parent`);
  }
};

// Update a parent by campminderId
export const updateParent = async (id: number, updates: Partial<Parent>, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, Collection.PARENTS, String(id));
    // @ts-expect-error - instance.update on both Transaction and WriteBatch have the same signature
    await (instance ? instance.update(parentRef, updates) : updateDoc(parentRef, updates));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "not-found") {
      throw new Error("Parent doesn't exist");
    }
    throw new Error(`Failed to update parent`);
  }
};

// Delete a parent and remove the parent from all associated campers
export const deleteParent = async (id: number, instance?: Transaction | WriteBatch): Promise<void> => {
  try {
    const parentRef = doc(db, Collection.PARENTS, String(id));
    await (instance ? instance.delete(parentRef) : deleteDoc(parentRef));
  } catch {
    throw new Error(`Failed to delete parent`);
  }
};
