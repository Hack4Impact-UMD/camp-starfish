import { updateAlbumItemReportDoc } from "@/data/firestore/albumItemReports";
import { useMutation } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";

interface ResolveAlbumItemReportRequest {
  albumId: string;
  albumItemId: string;
  albumItemReportId: string;
  resolverId: number;
  resolutionMessage: string;
}

async function resolveAlbumItemReport(req: ResolveAlbumItemReportRequest) {
  const { albumId, albumItemId, albumItemReportId, ...rest } = req;
  await updateAlbumItemReportDoc(albumId, albumItemId, albumItemReportId, {
    ...rest,
    status: "RESOLVED",
    resolvedAt: serverTimestamp()
  });
}

export default function useResolveAlbumItemReport() {
  return useMutation({
    mutationFn: (req: ResolveAlbumItemReportRequest) => resolveAlbumItemReport(req)
  })
}