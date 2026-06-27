import { db } from "@/config/firebase";
import { createSectionDoc } from "@/data/firestore/sections";
import { setSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { SectionScheduleDoc } from "@/data/firestore/types/documents";
import { getBlockIdFromNum } from "@/types/scheduling/schedulingUtils";
import { SectionType } from "@/types/sessions/sessionTypes";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Timestamp, Transaction } from "firebase/firestore";
import { Moment } from "moment";

interface CreateSectionRequest {
  sessionId: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
  type: SectionType;
}

const DEFAULT_NUMBER_BLOCKS = 5;

async function createSection(req: CreateSectionRequest) {
  const { sessionId, ...rest } = req;
  if (rest.type === "COMMON") {
    await createSectionDoc(sessionId, {
      name: rest.name,
      startDate: Timestamp.fromDate(rest.startDate.clone().startOf('day').toDate()),
      endDate: Timestamp.fromDate(rest.endDate.clone().endOf('day').toDate()),
      type: rest.type,
    });
    return;
  }

  const sectionScheduleDoc: SectionScheduleDoc = {
    type: rest.type,
    blocks: {},
    alternatePeriodsOff: {}
  };
  for (let i = 0; i < DEFAULT_NUMBER_BLOCKS; i++) {
    sectionScheduleDoc.blocks[getBlockIdFromNum(i)] = {
      activities: [],
      periodsOff: []
    }
  }
  await runTransaction(db, async (transaction: Transaction) => {
    const sectionId = await createSectionDoc(sessionId, {
      name: rest.name,
      startDate: Timestamp.fromDate(rest.startDate.clone().startOf('day').toDate()),
      endDate: Timestamp.fromDate(rest.endDate.clone().endOf('day').toDate()),
      type: rest.type,
      publishedAt: null,
    }, transaction);
    await setSectionScheduleDoc(sessionId, sectionId, sectionScheduleDoc);
  })
}

export default function useCreateSection() {
  return useMutation({
    mutationFn: (req: CreateSectionRequest) => createSection(req),
    onSuccess: (_data, { sessionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
    }
  });
}