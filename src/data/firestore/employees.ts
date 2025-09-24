import { db } from "@/config/firebase";
import { Employee, EmployeeID } from "@/types/personTypes";
import { collection, deleteDoc, doc, FirestoreError, getDocs, or, query, Transaction, where, WriteBatch } from "firebase/firestore";
import { Collection } from "./utils";

export async function getEmployeeById(id: string | number): Promise<Employee> {
  try {
    const q = query(
      collection(db, Collection.EMPLOYEES),
      or(where('campminderId', '==', id), where('uid', '==', id))
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error(`No employee found with uid or campminderId "${id}"`);
    return snap.docs[0].data() as Employee;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (e instanceof Error && e.message.includes('No employee found with uid')) {
      throw e;
    }
    throw new Error(`getEmployeeById failed: ${errorMessage}`);
  }
}

export async function getEmployeeByEmail(email: string): Promise<Employee> {
  try {
    const q = query(collection(db, Collection.EMPLOYEES), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error(`No employee found with email "${email}"`);
    return snap.docs[0].data() as Employee;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (e instanceof Error && e.message.includes('No employee found with email')) {
      throw e;
    }
    throw new Error(`getEmployeeByEmail failed: ${errorMessage}`);
  }
}

export async function createEmployee(employee: EmployeeID, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    const employeeRef = doc(db, Collection.EMPLOYEES, String(employee.id));
    // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
    await (instance ? instance.set(employeeRef, employee) : setDoc(employeeRef, employee));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "already-exists") {
      throw new Error("Employee already exists");
    }
    throw new Error(`Failed to create employee`);
  }
}

export async function updateEmployee(id: number, updates: Partial<Employee>, instance?: Transaction | WriteBatch) {
  try {
    const employeeRef = doc(db, Collection.EMPLOYEES, id.toString());
    // @ts-expect-error - instance.update on both Transaction and WriteBatch have the same signature
    await (instance ? instance.update(employeeRef, updates) : updateDoc(employeeRef, updates));
  } catch (error: unknown) {
    if (error instanceof FirestoreError &&  error.code === "not-found") {
      throw new Error("Employee not found");
    }
    throw new Error(`Failed to update employee`);
  }
}

export async function deleteEmployee(id: number, instance?: Transaction | WriteBatch) {
  try {
    const employeeRef = doc(db, Collection.EMPLOYEES, id.toString());
    await (instance ? instance.delete(employeeRef) : deleteDoc(employeeRef));
  } catch {
    throw new Error(`Failed to delete employee`);
  }
}