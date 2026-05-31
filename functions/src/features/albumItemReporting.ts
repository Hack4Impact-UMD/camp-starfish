import { CallableRequest, HttpsError, onCall } from "firebase-functions/https";
import { adminDb } from "../config/firebaseAdminConfig";
import { createAlbumItemReportDoc, getPendingReportDocByReporterId } from "../data/firestore/albumItemReports";
import { FieldValue } from "firebase-admin/firestore";
import { Role } from "@/types/users/userTypes";

interface CreateAlbumItemReportRequest {
  albumId: string;
  albumItemId: string;
  reporterId: number;
  reportMessage: string;
}

async function createAlbumItemReport(req: CreateAlbumItemReportRequest) {
  const { albumId, albumItemId, ...rest } = req;
  return await adminDb.runTransaction(async (transaction) => {
    const existingReport = await getPendingReportDocByReporterId(albumId, albumItemId, req.reporterId, transaction);
    if (existingReport) {
      throw new HttpsError("failed-precondition", "Reporter already has a pending report for this album item.");
    }
    const reportId = await createAlbumItemReportDoc(albumId, albumItemId, {
      ...rest,
      status: "PENDING",
      reportedAt: FieldValue.serverTimestamp()
    }, transaction);
    return reportId;
  });
}

export const createAlbumItemReportCloudFunction = onCall(async (req: CallableRequest<CreateAlbumItemReportRequest>) => {
  const allowedRoles: Role[] = ["STAFF", "ADMIN"];
  if (!allowedRoles.includes(req.auth?.token.role)) {
    throw new HttpsError("permission-denied", "User does not have permission to create an album item report.");
  }
  await createAlbumItemReport(req.data);
});