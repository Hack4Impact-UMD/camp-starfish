import { db } from "@/config/firebase";
import { Session, SessionID } from "@/types/sessionTypes";
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
import { FirestoreError } from "firebase/firestore";

export async function getSessionById(id: string, transaction?: Transaction): Promise<SessionID> {
    const sessionRef = doc(db, Collection.SESSIONS, id);
    let sessionDoc;
    try {
        sessionDoc = await (transaction ? transaction.get(sessionRef) : getDoc(sessionRef));
    } catch (error: unknown) {
        if (error instanceof FirestoreError && error.code === 'not-found') {
            throw new Error("Session doesn't exist");
        }
        throw new Error(`Failed to get session`);
    }
    if (!sessionDoc.exists()) {
        throw new Error("Session not found");
    }
    return { id: sessionDoc.id, ...sessionDoc.data() } as SessionID;
}

export async function createSession(session: Session, instance?: Transaction | WriteBatch): Promise<string> {
    try {
        // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
        const sessionRef = await (instance ? instance.set(doc(db, Collection.SESSIONS, randomUUID()), session) : addDoc(collection(db, Collection.SESSIONS), session));
        return sessionRef.id;
    } catch (error: unknown) {
        if (error instanceof FirestoreError && error.code === "already-exists") {
            throw new Error("Session already exists");
        }
        throw new Error(`Failed to create session`);
    }
}

export async function updateSession(id: string, updates: Partial<Session>, instance?: Transaction | WriteBatch): Promise<void> {
    try {
        const sessionRef = doc(db, Collection.SESSIONS, id);
        // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
        await (instance ? instance.set(sessionRef, updates) : updateDoc(sessionRef, updates));
    } catch (error: unknown) {
        if (error instanceof FirestoreError && error.code === "not-found") {
            throw new Error("Session not found");
        }
        throw new Error(`Failed to update session`);
    }
}

export async function deleteSession(id: string, instance?: Transaction | WriteBatch): Promise<void> {
    try {
        const sessionRef = doc(db, Collection.SESSIONS, id);
        await (instance ? instance.delete(sessionRef) : deleteDoc(sessionRef));
    } catch {
        throw new Error(`Failed to delete session`);
    }
}