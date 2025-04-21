import { db } from "@/config/firebase"; 
import { Session } from "@/types/sessionTypes";
import {
    doc,
    collection,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

const SESSIONS_COLLECTION = "sessions";

export async function getSessionById(id: string): Promise<Session> {
    try {
        const sessionRef = doc(db, SESSIONS_COLLECTION, id);
        const sessionDoc = await getDoc(sessionRef);
        if (!sessionDoc.exists()) {
            throw new Error("Session not found");
        }
        return sessionDoc.data() as Session;
    } catch (error: any) {
        throw new Error(`Failed to get session: ${error.code}`);
    }
}

export async function createSession(session: Session): Promise<string> {
    try {
        const sessionRef = await addDoc(collection(db, SESSIONS_COLLECTION), session);
        return sessionRef.id;
    } catch (error: any) {
        throw new Error(`Failed to create session: ${error.code}`);
    }
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
    try {
        const sessionRef = doc(db, SESSIONS_COLLECTION, id);
        await updateDoc(sessionRef, updates);
    } catch (error: any) {
        throw new Error(`Failed to update session: ${error.code}`);
    }
}

export async function deleteSession(id: string): Promise<void> {
    try {
        const sessionRef = doc(db, SESSIONS_COLLECTION, id);
        await deleteDoc(sessionRef);
    } catch (error: any) {
        throw new Error(`Failed to delete session: ${error.code}`);
    }
}