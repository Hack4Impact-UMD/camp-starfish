import { db } from "@/config/firebase";
import { Session } from "@/types/sessionTypes";
import { randomUUID } from "crypto";
import {
    doc,
    collection,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    Transaction,
    WriteBatch,
} from "firebase/firestore";
import { Collection } from "./utils";

export async function getSessionById(id: string, transaction?: Transaction): Promise<Session> {
    const sessionRef = doc(db, Collection.SESSIONS, id);
    let sessionDoc;
    try {
        sessionDoc = await (transaction ? transaction.get(sessionRef) : getDoc(sessionRef));
    } catch (error: any) {
        throw new Error(`Failed to get session: ${error.code}`);
    }
    if (!sessionDoc.exists()) {
        throw new Error("Session not found");
    }
    return sessionDoc.data() as Session;
}

export async function createSession(session: Session, instance?: Transaction | WriteBatch): Promise<string> {
    try {
        // @ts-ignore
        const sessionRef = await (instance ? instance.set(doc(db, Collection.SESSIONS, randomUUID()), session) : addDoc(collection(db, Collection.SESSIONS), session));
        return sessionRef.id;
    } catch (error: any) {
        throw new Error(`Failed to create session: ${error.code}`);
    }
}

export async function updateSession(id: string, updates: Partial<Session>, instance?: Transaction | WriteBatch): Promise<void> {
    try {
        const sessionRef = doc(db, Collection.SESSIONS, id);
        // @ts-ignore
        await (instance ? Transaction.set(sessionRef, updates) : updateDoc(sessionRef, updates));
    } catch (error: any) {
        if (error.code === "not-found") {
            throw new Error("Session not found");
        }
        throw new Error(`Failed to update session: ${error.code}`);
    }
}

export async function deleteSession(id: string, instance?: Transaction | WriteBatch): Promise<void> {
    try {
        const sessionRef = doc(db, Collection.SESSIONS, id);
        await (instance ? instance.delete(sessionRef) : deleteDoc(sessionRef));
    } catch (error: any) {
        throw new Error(`Failed to delete session: ${error.code}`);
    }
}