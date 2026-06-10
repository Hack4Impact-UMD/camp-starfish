import { Camper, Parent, Role } from "@/types/users/userTypes";
import { HttpsError, onCall } from "firebase-functions/https"
import { ProcessFamilyCsvRequest } from "@/features/userManagement/useProcessFamilyCsv";
import { ProcessEmployeeCsvRequest } from "@/features/userManagement/useProcessEmployeeCsv";
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
  const parents = input.parents.map(parent => ({
    ...parent,
    dateOfBirth: moment(parent.dateOfBirth)
  }))

  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = [...Object.keys(campers), ...Object.keys(parents)].map(id => parseInt(id));
    const existingUsers = await batchGetUserDocs(allIds);

    const { trueGroup: existingCamperUpdates, falseGroup: newCampers } = partition(Object.values(campers), (camper) => existingUsers.some(user => user.id === camper.id));
    const { trueGroup: existingParentUpdates, falseGroup: newParents } = partition(Object.values(parents), (parent) => existingUsers.some(user => user.id === parent.id));

    const promises = [
      newCampers.map((camper) => {
        const { id, ...camperDoc } = camper;
        return createUserDoc(id, {
          ...camperDoc,
          dateOfBirth: Timestamp.fromDate(moment(camperDoc.dateOfBirth).toDate()),
          role: "CAMPER",
          photoPermissions: "PRIVATE",
          nonoListIds: [],
        }, transaction);
      }),
      newParents.map((parent) => {
        const { id, ...parentDoc } = parent;
        return createUserDoc(id, { ...parentDoc, role: "PARENT", dateOfBirth: Timestamp.fromDate(moment(parentDoc.dateOfBirth).toDate()) }, transaction);
      }),
      existingCamperUpdates.map((camperUpdates) => {
        const { id, ...docUpdates } = camperUpdates;
        const existingCamper = existingUsers.find(camper => camper.id === id) as Camper;
        if (existingCamper.name.firstName === docUpdates.name.firstName && existingCamper.name.middleName === docUpdates.name.middleName && existingCamper.name.lastName === docUpdates.name.lastName && docUpdates.parentIds.every(parentId => existingCamper.parentIds.includes(parentId))) return;
        return updateUserDoc(id, {
          parentIds: FieldValue.arrayUnion(...camperUpdates.parentIds),
        }, transaction);
      }),
      existingParentUpdates.map((parentUpdates) => {
        const { id, ...docUpdates } = parentUpdates;
        const existingParent = existingUsers.find(parent => parent.id === id) as Parent;
        if (existingParent.name.firstName === docUpdates.name.firstName && existingParent.name.middleName === docUpdates.name.middleName && existingParent.name.lastName === docUpdates.name.lastName && docUpdates.camperIds.every(camperId => existingParent.camperIds.includes(camperId))) return;
        return updateUserDoc(id, {
          camperIds: FieldValue.arrayUnion(...docUpdates.camperIds),
        }, transaction);
      })
    ];
    await Promise.all(promises);
  });
});

export const processEmployeeCsv = onCall(async (req) => {
  const role: Role | undefined = req.auth?.token.role;
  if (role !== "ADMIN") {
    throw new HttpsError("permission-denied", "You do not have permission to create new users.");
  }

  const employees = (JSON.parse(req.data) as ProcessEmployeeCsvRequest).employees.map(employee => ({
    ...employee,
    dateOfBirth: moment(employee.dateOfBirth)
  }));
  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = employees.map(employee => employee.id);
    const existingEmployees = await batchGetUserDocs(allIds);
    const newEmployees = employees.filter(employee => !existingEmployees.some(user => user.id === employee.id));
    const promises = newEmployees.map(employee => {
      const { id, ...employeeDoc } = employee;
      // @ts-expect-error - prevent extra fields from being added to Photographer type
      return createUserDoc(id, employeeDoc.role === "PHOTOGRAPHER" ? {...employeeDoc, dateOfBirth: Timestamp.fromDate(moment(employeeDoc.dateOfBirth).toDate()) } : {
        ...employeeDoc,
        dateOfBirth: Timestamp.fromDate(moment(employeeDoc.dateOfBirth).toDate()),
        nonoListIds: [],
        yesyesListIds: []
      }, transaction);
    });
    await Promise.all(promises);
  })
});