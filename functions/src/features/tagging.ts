import { RootLevelCollection } from "@/data/firestore/types/collections";
import { Name } from "@/types/users/userTypes";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";
import { aggregateUserDirectoryDocs, createUserDirectoryDoc, executeUserDirectoryQuery, updateUserDirectoryDoc } from "../data/firestore/userDirectory";
import { getFullName } from "@/types/users/userUtils";
import { FieldValue } from "firebase-admin/firestore";

const onUserCreated = onDocumentCreated(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  const name: Name = event.data?.data()?.name;
  const fullName: string = getFullName(name);
  adminDb.runTransaction(async (transaction) => {
    const { docCount } = await aggregateUserDirectoryDocs({
      transaction,
      aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
    }) as { docCount: number };
    if (docCount === 0) {
      await createUserDirectoryDoc(0, { [Number(userId)]: fullName }, transaction);
      return;
    }

    try {
      await updateUserDirectoryDoc(docCount - 1, { [userId]: fullName }, transaction);
    } catch {
      await createUserDirectoryDoc(docCount, { [userId]: fullName }, transaction);
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
      await updateUserDirectoryDoc(doc.page, { [userId]: afterFullName }, transaction);
    } catch {
      await updateUserDirectoryDoc(doc.page, { [userId]: FieldValue.delete() }, transaction);
      const { docCount } = await aggregateUserDirectoryDocs({
        transaction,
        aggregationQueryOptions: { aggregations: [{ aggregateFieldName: 'docCount', operation: 'count' }] }
      }) as { docCount: number };
      await createUserDirectoryDoc(docCount, { [userId]: afterFullName }, transaction);
    }
    
  })
});

export const taggingCloudFunctions = {
  onUserCreated,
  onUserUpdated
}