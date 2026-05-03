import { RootLevelCollection } from "@/data/firestore/types/collections";
import { Name } from "@/types/users/userTypes";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";
import { aggregateTagDirectoryDocs, createTagDirectoryDoc, executeTagDirectoryQuery, updateTagDirectoryDoc } from "../data/firestore/tagDirectory";
import { getFullName } from "@/types/users/userUtils";
import { FieldValue } from "firebase-admin/firestore";

const onUserCreated = onDocumentCreated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const name: Name = event.data?.data()?.name;
  const fullName: string = getFullName(name);
  adminDb.runTransaction(async (transaction) => {
    const { docCount } = await aggregateTagDirectoryDocs({ aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] } }, transaction) as { docCount: number };
    if (docCount === 0) {
      await createTagDirectoryDoc(0, { [Number(userId)]: fullName }, transaction);
      return;
    }

    try {
      await updateTagDirectoryDoc(docCount - 1, { [userId]: fullName }, transaction);
    } catch {
      await createTagDirectoryDoc(docCount, { [userId]: fullName }, transaction);
    }
  })
});

const onUserUpdated = onDocumentUpdated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const beforeData = event.data?.before.data().name;
  const afterData = event.data?.after.data().name;

  const beforeFullName = getFullName(beforeData);
  const afterFullName = getFullName(afterData);
  if (beforeFullName === afterFullName) {
    return;
  }
  await adminDb.runTransaction(async (transaction) => {
    const docs = await executeTagDirectoryQuery({
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
      await updateTagDirectoryDoc(doc.page, { [userId]: afterFullName }, transaction);
    } catch {
      await updateTagDirectoryDoc(doc.page, { [userId]: FieldValue.delete() }, transaction);
      const { docCount } = await aggregateTagDirectoryDocs({ aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] } }, transaction) as { docCount: number };
      await createTagDirectoryDoc(docCount, { [userId]: afterFullName }, transaction);
    }
    
  })
});

export const taggingCloudFunctions = {
  onUserCreated,
  onUserUpdated
}