import { db } from "@/config/firebase";
import { updateAttendeeDoc } from "@/data/firestore/attendees";
import { getProgramAreaDoc } from "@/data/firestore/programAreas";
import { useMutation } from "@tanstack/react-query";
import { deleteField, runTransaction, Transaction } from "firebase/firestore";

interface SetProgramCounselorAreaRequest {
  sessionId: string;
  stafferId: number;
  programAreaId: string | null;
}

async function setProgramCounselorArea(req: SetProgramCounselorAreaRequest) {
  const { sessionId, stafferId, programAreaId } = req;
  if (programAreaId === null) {
    await updateAttendeeDoc(stafferId, sessionId, { programCounselorFor: deleteField() });
    return;
  }
  await runTransaction(db, async (transaction: Transaction) => {
    const programArea = await getProgramAreaDoc(programAreaId, transaction);
    if (programArea.isDeleted) {
      throw new Error("The selected program area does not exist.");
    }
    await updateAttendeeDoc(stafferId, sessionId, { programCounselorFor: programAreaId }, transaction);
  });
}

export default function useSetProgramCounselorArea() {
  return useMutation({
    mutationFn: (req: SetProgramCounselorAreaRequest) => setProgramCounselorArea(req)
  })
}