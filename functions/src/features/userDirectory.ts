import { RootLevelCollection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";
import { aggregateUserDirectoryDocs, createUserDirectoryDoc, executeUserDirectoryQuery, updateUserDirectoryDoc } from "../data/firestore/userDirectory";
import { FieldValue } from "firebase-admin/firestore";
import { UserDoc } from "@/data/firestore/types/documents";
import { UserDirectoryItem } from "@/types/albums/albumTypes";

const onUserCreated = onDocumentCreated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const userDoc = event.data?.data() as UserDoc;
  await appendUserDirectoryItem(userId, { name: userDoc.name, role: userDoc.role });
});

const onUserUpdated = onDocumentUpdated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const afterData = event.data?.after.data() as UserDoc;

  const directoryDataUpdates = {
    [Number(userId)]: {
      name: afterData.name,
      role: afterData.role
    }
  };

  await adminDb.runTransaction(async (transaction) => {
    const docs = await executeUserDirectoryQuery({
      transaction,
      queryOptions: {
        // @ts-expect-error - TypeScript doesn't recognize arbitrary keys
        orderBy: [{ fieldPath: userId, direction: 'asc' }]
      }
    });

    if (docs.length === 0) {
      await appendUserDirectoryItem(userId, { name: afterData.name, role: afterData.role });
      return;
    }

    const doc = docs[0];
    try {
      await updateUserDirectoryDoc(doc.page, directoryDataUpdates, transaction);
    } catch {
      await updateUserDirectoryDoc(doc.page, { [userId]: FieldValue.delete() }, transaction);
      const { docCount } = await aggregateUserDirectoryDocs({
        transaction,
        aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
      }) as { docCount: number };
      await createUserDirectoryDoc(docCount, directoryDataUpdates, transaction);
    }
  })
});

async function appendUserDirectoryItem(userId: string, directoryItem: UserDirectoryItem) {
  const directoryData = { [userId]: directoryItem };
  await adminDb.runTransaction(async (transaction) => {
    const { docCount } = await aggregateUserDirectoryDocs({
      transaction,
      aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
    }) as { docCount: number };
    if (docCount === 0) {
      await createUserDirectoryDoc(0, directoryData, transaction);
      return;
    }

    try {
      await updateUserDirectoryDoc(docCount - 1, directoryData, transaction);
    } catch {
      await createUserDirectoryDoc(docCount, directoryData, transaction);
    }
  })
}

export const userDirectoryCloudFunctions = {
  onUserCreated,
  onUserUpdated
}