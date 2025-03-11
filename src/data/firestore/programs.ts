import { db } from "@/config/firebase"; 
import { Program } from "@/types/programTypes";
import {
    doc,
    collection,
    Transaction,
} from "firebase/firestore";

const PROGRAM_COLLECTION = "programs";

async function getExistingProgramDoc(transaction: Transaction, id: string) {
    const programRef = doc(db, PROGRAM_COLLECTION, id);
    const programDoc = await transaction.get(programRef);
    if (!programDoc.exists()) {
      throw new Error("Program not found");
    }
    return { programRef, programDoc };
  }

export async function getProgramById(transaction: Transaction, id: string): Promise<Program> {
    try {
        const { programDoc } = await getExistingProgramDoc(transaction, id);
        return programDoc.data() as Program;
    } catch (error) {
        throw new Error(`Failed to get program: ${error}`);
    }
};

//TODO: check if program already exists
export async function createProgram(transaction: Transaction, program: Program): Promise<string> {
    try {
        const programRef = doc(collection(db, PROGRAM_COLLECTION));
        transaction.set(programRef, program);
        return programRef.id;
    } catch (error) {
        throw new Error(`Failed to create program: ${error}`);
    }
};

export async function updateProgram(transaction: Transaction, id: string, updates: Partial<Program>): Promise<void> {
    try {
        const { programRef } = await getExistingProgramDoc(transaction, id);
        transaction.update(programRef, updates);
    } catch (error) {
        throw new Error(`Failed to update program: ${error}`);
    }
};

export async function deleteProgram(transaction: Transaction, id: string): Promise<void> {
    try {
        const { programRef } = await getExistingProgramDoc(transaction, id);
        transaction.delete(programRef);
    } catch (error) {
        throw new Error(`Failed to delete program: ${error}`);
    }
}

