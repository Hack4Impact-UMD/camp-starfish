import { RootLevelCollection } from "@/data/firestore/types/collections";
import { Name, Role } from "@/types/users/userTypes";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";
import { aggregateUserDirectoryDocs, createUserDirectoryDoc, executeUserDirectoryQuery, updateUserDirectoryDoc } from "../data/firestore/userDirectory";
import { getFullName } from "@/types/users/userUtils";
import { FieldValue, UpdateData } from "firebase-admin/firestore";
import { UserDirectoryDoc, UserDoc } from "@/data/firestore/types/documents";
import { diff } from "@/utils/data/diff";
import { UserDirectoryItem } from "@/types/albums/albumTypes";

const onUserCreated = onDocumentCreated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const userDoc = event.data?.data() as UserDoc;
  const directoryData = {
    [Number(userId)]: {
      name: userDoc.name,
      role: userDoc.role
    }
  }
  
  adminDb.runTransaction(async (transaction) => {
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
});

const onUserUpdated = onDocumentUpdated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const afterData = event.data?.after.data().name;

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

export const taggingCloudFunctions = {
  onUserCreated,
  onUserUpdated
}