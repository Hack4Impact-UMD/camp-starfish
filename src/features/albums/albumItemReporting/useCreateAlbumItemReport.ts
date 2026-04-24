import { createAlbumItemReportDoc, doesReporterHavePendingReportForAlbumItem } from "@/data/firestore/albumItemReports";
import { useMutation } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";

interface CreateAlbumItemReportRequest {
  albumId: string;
  albumItemId: string;
  reporterId: number;
  reportMessage: string;
}

async function createAlbumItemReport(req: CreateAlbumItemReportRequest) {
  const { albumId, albumItemId, ...rest } = req;
  if (await doesReporterHavePendingReportForAlbumItem(albumId, albumItemId, req.reporterId)) {
    throw Error("Reporter already has a pending report for this album item.");
  }
  const reportId = await createAlbumItemReportDoc(albumId, albumItemId, {
    status: 'PENDING',
    ...rest,
    reportedAt: serverTimestamp()
  });
  return reportId;
}

export default function useCreateAlbumItemReport() {
  return useMutation({
    mutationFn: (req: CreateAlbumItemReportRequest) => createAlbumItemReport(req)
  })
}