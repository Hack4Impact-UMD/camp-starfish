import { db } from "@/config/firebase";
import { updateSectionDoc } from "@/data/firestore/sections";
import { deleteSectionScheduleDoc, setSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { SchedulingSectionDoc } from "@/data/firestore/types/documents";
import { DEFAULT_NUMBER_BLOCKS, getEmptySectionScheduleDoc } from "@/types/scheduling/schedulingUtils";
import { SectionType } from "@/types/sessions/sessionTypes";
import { useMutation } from "@tanstack/react-query";
import { deleteField, runTransaction, Timestamp, Transaction, UpdateData } from "firebase/firestore";
import { Moment } from "moment";

interface UpdateSectionRequest {
  sessionId: string;
  sectionId: string;
  name?: string;
  startDate?: Moment;
  endDate?: Moment;
  type?: SectionType;
}

async function updateSection(req: UpdateSectionRequest) {
  const { sessionId, sectionId, ...updates } = req;
  switch (updates.type) {
    case "COMMON":
      await runTransaction(db, async (transaction: Transaction) => {
        await Promise.all([
          updateSectionDoc(sessionId, sectionId, {
            name: updates.name,
            startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.clone().startOf('day').toDate()) : undefined,
            endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.clone().endOf('day').toDate()) : undefined,
            type: "COMMON",
            publishedAt: deleteField()
          }, transaction),
          deleteSectionScheduleDoc(sessionId, sectionId, transaction)
        ]);
      });
      break;
    case "BUNDLE":
    case "BUNK-JAMBO":
    case "NON-BUNK-JAMBO":
      const sectionUpdates: UpdateData<SchedulingSectionDoc> = {
        name: updates.name,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.clone().startOf('day').toDate()) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.clone().endOf('day').toDate()) : undefined,
        type: updates.type,
        publishedAt: null
      }
      const sectionScheduleDoc = getEmptySectionScheduleDoc(updates.type, DEFAULT_NUMBER_BLOCKS);
      await runTransaction(db, async (transaction: Transaction) => {
        await Promise.all([
          updateSectionDoc(sessionId, sectionId, sectionUpdates, transaction),
          setSectionScheduleDoc(sessionId, sectionId, sectionScheduleDoc, transaction)
        ])
      });
      break;
    default:
      await updateSectionDoc(sessionId, sectionId, {
        name: updates.name,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.clone().startOf('day').toDate()) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.clone().endOf('day').toDate()) : undefined,
      });
  }
}

export default function useUpdateSection() {
  return useMutation({
    mutationFn: (req: UpdateSectionRequest) => updateSection(req),
    onSuccess: (_data, { sectionId, sessionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections', sectionId] });
    }
  });
}