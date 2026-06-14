import { RootLevelCollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { DaysOffScheduleDoc } from "@/data/firestore/types/documents";
import { onDocumentUpdated } from "firebase-functions/firestore";

function diffDaysOffDocs(beforeDoc: DaysOffScheduleDoc, afterDoc: DaysOffScheduleDoc) {
  const addedDaysOffInSession = afterDoc.daysOffInSession.filter(d => !beforeDoc.daysOffInSession.includes(d));
  const removedDaysOffInSession = beforeDoc.daysOffInSession.filter(d => !afterDoc.daysOffInSession.includes(d));

}

const onDaysOffUpdated = onDocumentUpdated(`/${RootLevelCollection.SESSIONS}/{sessionId}/${SessionsSubcollection.DAYS_OFF_SCHEDULE}/${SessionsSubcollection.DAYS_OFF_SCHEDULE}`, async (event) => {
  const { sessionId } = event.params;
  const beforeDoc = event.data?.before.data() as DaysOffScheduleDoc;
  const afterDoc = event.data?.after.data() as DaysOffScheduleDoc;

  const diff = diffDaysOffDocs(beforeDoc, afterDoc)
});