import { RootLevelCollection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";
import { aggregatePersonDirectoryDocs, createPersonDirectoryDoc, executePersonDirectoryQuery, updatePersonDirectoryDoc } from "../data/firestore/personDirectory";
import { FieldValue } from "firebase-admin/firestore";
import { PersonDoc } from "@/data/firestore/types/documents";
import { PersonDirectoryItem } from "@/types/sessions/sessionTypes";

const onPersonCreated = onDocumentCreated(`/${RootLevelCollection.PEOPLE}/{personId}`, async (event) => {
  const { personId } = event.params;
  const personDoc = event.data?.data() as PersonDoc;
  await appendPersonDirectoryItem(personId, { name: personDoc.name, role: personDoc.role });
});

const onPersonUpdated = onDocumentUpdated(`/${RootLevelCollection.PEOPLE}/{personId}`, async (event) => {
  const { personId } = event.params;
  const afterData = event.data?.after.data() as PersonDoc;

  const directoryDataUpdates = {
    [Number(personId)]: {
      name: afterData.name,
      role: afterData.role
    }
  };

  await adminDb.runTransaction(async (transaction) => {
    const docs = await executePersonDirectoryQuery({
      transaction,
      queryOptions: {
        // @ts-expect-error - TypeScript can't handle dynamic keys
        orderBy: [{ fieldPath: personId, direction: 'asc' }]
      }
    });

    if (docs.length === 0) {
      await appendPersonDirectoryItem(personId, { name: afterData.name, role: afterData.role });
      return;
    }

    const doc = docs[0];
    try {
      await updatePersonDirectoryDoc(doc.page, directoryDataUpdates, transaction);
    } catch {
      await updatePersonDirectoryDoc(doc.page, { [personId]: FieldValue.delete() }, transaction);
      const { docCount } = await aggregatePersonDirectoryDocs({
        transaction,
        aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
      }) as { docCount: number };
      await createPersonDirectoryDoc(docCount, directoryDataUpdates, transaction);
    }
  })
});

async function appendPersonDirectoryItem(personId: string, directoryItem: PersonDirectoryItem) {
  const directoryData = { [personId]: directoryItem };
  await adminDb.runTransaction(async (transaction) => {
    const { docCount } = await aggregatePersonDirectoryDocs({
      transaction,
      aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
    }) as { docCount: number };
    if (docCount === 0) {
      await createPersonDirectoryDoc(0, directoryData, transaction);
      return;
    }

    try {
      await updatePersonDirectoryDoc(docCount - 1, directoryData, transaction);
    } catch {
      await createPersonDirectoryDoc(docCount, directoryData, transaction);
    }
  })
}

export const personDirectoryCloudFunctions = {
  onPersonCreated,
  onPersonUpdated
}