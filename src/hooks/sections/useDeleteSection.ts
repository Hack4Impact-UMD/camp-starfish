import { db } from "@/config/firebase";
import { deleteSectionDoc } from "@/data/firestore/sections";
import { deleteSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { deleteActivityPreferencesDoc } from "@/data/firestore/activityPreferences";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Transaction } from "firebase/firestore";

interface DeleteSectionRequest {
  sessionId: string;
  sectionId: string;
}

async function deleteSection(req: DeleteSectionRequest) {
  const { sessionId, sectionId } = req;
  await runTransaction(db, async (transaction: Transaction) => {
    await Promise.all([
      deleteSectionDoc(sectionId, sessionId, transaction), // (id, sessionID) order!
      deleteSectionScheduleDoc(sessionId, sectionId, transaction),
      deleteActivityPreferencesDoc(sessionId, sectionId, transaction),
    ]);
  });
}

export default function useDeleteSection() {
  return useMutation({
    mutationFn: (req : DeleteSectionRequest) => deleteSection(req),
    onSuccess: (_data, { sessionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
    }
  });
}
