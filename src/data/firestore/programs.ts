import { db } from "@/config/firebase"; 
import { Program } from "@/types/programTypes";
import {
    doc,
    collection,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

const PROGRAM_COLLECTION = "programs";

export async function getProgramById(id: string): Promise<Program> {
    try {
        const programRef = doc(db, PROGRAM_COLLECTION, id);
        const programDoc = await getDoc(programRef);
        if (!programDoc.exists()) {
            throw new Error("Program not found");
        }
        return programDoc.data() as Program;
    } catch (error: any) {
        throw new Error(`Failed to get program: ${error.code}`);
    }
}

export async function createProgram(program: Program): Promise<string> {
    try {
        const programRef = await addDoc(collection(db, PROGRAM_COLLECTION), program);
        return programRef.id;
    } catch (error: any) {
        throw new Error(`Failed to create program: ${error.code}`);
    }
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<void> {
    try {
        const programRef = doc(db, PROGRAM_COLLECTION, id);
        await updateDoc(programRef, updates);
    } catch (error: any) {
        throw new Error(`Failed to update program: ${error.code}`);
    }
}

export async function deleteProgram(id: string): Promise<void> {
    try {
        const programRef = doc(db, PROGRAM_COLLECTION, id);
        await deleteDoc(programRef);
    } catch (error: any) {
        throw new Error(`Failed to delete program: ${error.code}`);
    }
}