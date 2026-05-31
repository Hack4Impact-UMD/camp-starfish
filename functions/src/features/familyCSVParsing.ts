import { Camper, Parent, Role, UnregisteredCamper, UnregisteredParent } from "@/types/users/userTypes";
import { HttpsError, onCall } from "firebase-functions/https"
import { ParseFamilyCSVResponse } from "@/data/storage/parseCampersCSV";
import { adminDb } from "../config/firebaseAdminConfig";
import { batchGetUserDocs, createUserDoc, updateUserDoc } from "../data/firestore/users";
import partition from "@/utils/data/partition";
import { FieldValue } from "firebase-admin/firestore";

export const handleFamilyCSVUpload = onCall(async (req) => {
  const role: Role | undefined = req.auth?.token.role;
  if (!role || role !== "ADMIN") {
    throw new HttpsError("permission-denied", "User does not have permission to create new users.");
  }

  const { campers, parents } = req.data as ParseFamilyCSVResponse;

  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = [...Object.keys(campers), ...Object.keys(parents)].map(id => parseInt(id));
    const existingUsers = await batchGetUserDocs(allIds);

    const { trueGroup: existingCamperUpdates, falseGroup: newCampers } = partition(Object.values(campers), (camper) => existingUsers.some(user => user.id === camper.id));
    const { trueGroup: existingParentUpdates, falseGroup: newParents } = partition(Object.values(parents), (parent) => existingUsers.some(user => user.id === parent.id));

    const promises = [
      newCampers.map((camper) => {
        const { id, ...camperDoc } = camper;
        return createUserDoc(id, { ...camperDoc, role: "CAMPER" }, transaction);
      }),
      newParents.map((parent) => {
        const { id, ...parentDoc } = parent;
        return createUserDoc(id, { ...parentDoc, role: "PARENT" }, transaction);
      }),
      existingCamperUpdates.map((camperUpdates) => {
        const { id, ...docUpdates } = camperUpdates;
        const existingCamper = existingUsers.find(camper => camper.id === id) as Camper | UnregisteredCamper;
        if (existingCamper.name.firstName === docUpdates.name.firstName && existingCamper.name.middleName === docUpdates.name.middleName && existingCamper.name.lastName === docUpdates.name.lastName && docUpdates.parentIds.every(parentId => existingCamper.parentIds.includes(parentId))) return;
        return updateUserDoc(id, {
          name: docUpdates.name,
          parentIds: FieldValue.arrayUnion(...camperUpdates.parentIds),
        }, transaction);
      }),
      existingParentUpdates.map((parentUpdates) => {
        const { id, ...docUpdates } = parentUpdates;
        const existingParent = existingUsers.find(parent => parent.id === id) as Parent | UnregisteredParent;
        if (existingParent.name.firstName === docUpdates.name.firstName && existingParent.name.middleName === docUpdates.name.middleName && existingParent.name.lastName === docUpdates.name.lastName && docUpdates.camperIds.every(camperId => existingParent.camperIds.includes(camperId))) return;
        return updateUserDoc(id, {
          name: docUpdates.name,
          camperIds: FieldValue.arrayUnion(...docUpdates.camperIds),
        }, transaction);
      })
    ];
    await Promise.all(promises);
  });
});