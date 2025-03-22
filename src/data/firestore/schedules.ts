import { db } from "@/config/firebase";
import { ProgramSection } from "@/types/programTypes";
import {
    query,
    where,
    getDocs,
    collection,
    Transaction
} from "firebase/firestore";

export async function getCamperSchedule(camperId: number, programId: string): Promise<ProgramSection[]> {
    try {
        const camperScheduleRef = collection(db, `programs/${programId}/camperSchedules`);
        const q = query(camperScheduleRef, where("campminderId", "==", camperId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as ProgramSection);
    } catch (error: any) {
        throw new Error(`Failed to get camper schedule: ${error.code}`);
    }
}

export async function getEmployeeSchedule(employeeId: number | string, programId: string): Promise<ProgramSection[]> {
    try {
        const employeeScheduleRef = collection(db, `programs/${programId}/employeeSchedules`);
        const q = query(employeeScheduleRef, where("campminderId", "==", employeeId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as ProgramSection);
    } catch (error: any) {
        throw new Error(`Failed to get employee schedule: ${error.code}`);
    }
}