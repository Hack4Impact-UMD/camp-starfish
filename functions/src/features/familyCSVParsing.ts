import { Role } from "@/types/users/userTypes";
import { HttpsError, onCall } from "firebase-functions/https"
import { ParseFamilyCSVResponse } from "@/data/storage/parseCampersCSV";
import { adminDb } from "../config/firebaseAdminConfig";
import { batchGetUserDocs, createUserDoc, updateUserDoc } from "../data/firestore/users";
import partition from "@/utils/data/partition";
import { FieldValue } from "firebase-admin/firestore";

export const handleFamilyCSVUpload = onCall({ memory:}, async (req) => {
  const role: Role | undefined = req.auth?.token.role;
  if (!role || role !== "ADMIN") {
    throw new HttpsError("permission-denied", "User does not have permission to create new users.");
  }

  const { campers, parents } = req.data as ParseFamilyCSVResponse;

  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = [...Object.keys(campers), ...Object.keys(parents)].map(id => parseInt(id));
    const existingUsers = await batchGetUserDocs(allIds);

    const { trueGroup: existingCampers, falseGroup: newCampers } = partition(Object.values(campers), (camper) => existingUsers.some(user => user.id === camper.id));
    const { trueGroup: existingParents, falseGroup: newParents } = partition(Object.values(parents), (parent) => existingUsers.some(user => user.id === parent.id));

    const promises = [
      newCampers.map((camper) => {
        const { id, ...camperDoc } = camper;
        return createUserDoc(id, { ...camperDoc, role: "CAMPER" }, transaction);
      }),
      newParents.map((parent) => {
        const { id, ...parentDoc } = parent;
        return createUserDoc(id, { ...parentDoc, role: "PARENT" }, transaction);
      }),
      existingCampers.map((camper) => {
        const { id, ...camperDoc } = camper;
        return updateUserDoc(id, {
          name: camperDoc.name,
          parentIds: FieldValue.arrayUnion(...camper.parentIds),
        }, transaction);
      }),
      existingParents.map((parent) => {
        const { id, ...parentDoc } = parent;
        return updateUserDoc(id, {
          name: parentDoc.name,
          camperIds: FieldValue.arrayUnion(...parentDoc.camperIds),
        }, transaction);
      })
    ];
    await Promise.all(promises);
  });
});