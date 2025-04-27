import { db } from "@/config/firebase";
import { Employee } from "@/types/personTypes";
import { collection, doc, Firestore, getDocs, or, query, Transaction, where } from "firebase/firestore";

const EMPLOYEES_COLLECTION = "employees";

export async function getEmployeeById(id: string | number, transaction?: Transaction): Promise<Employee> {
    try {
      const q = query(
        collection(db, EMPLOYEES_COLLECTION),
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
  
  export async function getEmployeeByEmail(
    transaction: Transaction,
    email: string
  ) {
    try {
      const q = query(collection(db, EMPLOYEES_COLLECTION), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error(`No employee found with email "${email}"`);
      return snap.docs[0].data();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (e instanceof Error && e.message.includes('No employee found with email')) {
        throw e;
      }
      throw new Error(`getEmployeeByEmail failed: ${errorMessage}`);
    }
  }
  
  export async function createEmployee(
    transaction: Transaction,
    employee: {
      campminderId?: number;
      email: string;
      uid?: string;
    }
  ) {
    try {
      const ref = doc(collection(db, EMPLOYEES_COLLECTION), employee.campminderId?.toString());
      transaction.set(ref, employee);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`createEmployee failed: ${errorMessage}`);
    }
  }
  
  export async function updateEmployee(
    transaction: Transaction,
    id: string | number,
    updates: Partial<{ campminderId?: number; email: string; uid?: string }>
  ) {
    try {
      const ref = doc(db, EMPLOYEES_COLLECTION, id.toString());
      transaction.update(ref, updates);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`updateEmployee failed: ${errorMessage}`);
    }
  }
  
  export async function deleteEmployee(
    transaction: Transaction,
    id: string | number
  ) {
    try {
      const ref = doc(db, EMPLOYEES_COLLECTION, id.toString());
      transaction.delete(ref);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`deleteEmployee failed: ${errorMessage}`);
    }
  }