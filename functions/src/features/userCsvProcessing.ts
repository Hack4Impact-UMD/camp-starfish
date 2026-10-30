import { Camper, Role } from "@/types/users/userTypes";
import { HttpsError, onCall } from "firebase-functions/https"
import { ProcessFamilyCsvRequest } from "@/features/userManagement/useProcessFamilyCsv";
import { ProcessCounselorCsvRequest } from "@/features/userManagement/useProcessCounselorCsv";
import { adminDb } from "../config/firebaseAdminConfig";
import { batchGetUserDocs, createUserDoc, updateUserDoc } from "../data/firestore/users";
import partition from "@/utils/data/partition";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import moment from "moment";

export const processFamilyCsv = onCall(async (req) => {
  const role: Role | undefined = req.auth?.token.role;
  if (!role || role !== "ADMIN") {
    throw new HttpsError("permission-denied", "You do not have permission to create new users.");
  }

  const input = JSON.parse(req.data) as ProcessFamilyCsvRequest;
  const campers = input.campers.map(camper => ({
    ...camper,
    dateOfBirth: moment(camper.dateOfBirth)
  }));

  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = campers.map(camper => camper.id);
    const existingUsers = await batchGetUserDocs(allIds);

    const newCampers = campers.filter((camper) => existingUsers.every(user => user.id !== camper.id));

    const camperPromises = newCampers.map((camper) => {
      const { id, ...camperDoc } = camper;
      return createUserDoc(id, {
        ...camperDoc,
        dateOfBirth: Timestamp.fromDate(moment(camperDoc.dateOfBirth).toDate()),
        role: "CAMPER",
        nonoListIds: [],
      }, transaction);
    });
    await Promise.all(camperPromises);
  });
});

export const processCounselorCsv = onCall(async (req) => {
  const role: Role | undefined = req.auth?.token.role;
  if (role !== "ADMIN") {
    throw new HttpsError("permission-denied", "You do not have permission to create new users.");
  }

  const counselors = (JSON.parse(req.data) as ProcessCounselorCsvRequest).counselors.map(counselor => ({
    ...counselor,
    dateOfBirth: moment(counselor.dateOfBirth)
  }));
  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = counselors.map(counselor => counselor.id);
    const existingCounselors = await batchGetUserDocs(allIds);
    const newCounselors = counselors.filter(counselor => !existingCounselors.some(user => user.id === counselor.id));
    const promises = newCounselors.map(counselor => {
      const { id, ...counselorDoc } = counselor;
      // @ts-expect-error - limitation of Firebase's types with using discriminated unions
      return createUserDoc(id, counselorDoc.role === "STAFF" ? {
        ...counselorDoc,
        dateOfBirth: Timestamp.fromDate(moment(counselorDoc.dateOfBirth).toDate()),
        nonoListIds: [],
        yesyesListIds: []
      } : {
        ...counselorDoc,
        dateOfBirth: Timestamp.fromDate(moment(counselorDoc.dateOfBirth).toDate()),
        nonoListIds: [],
        yesyesListIds: [],
        isSuperAdmin: false
      }, transaction);
    });
    await Promise.all(promises);
  })
});