import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

interface CreateAlbumItemReportRequest {
  albumId: string;
  albumItemId: string;
  reporterId: number;
  reportMessage: string;
}

async function createAlbumItemReport(req: CreateAlbumItemReportRequest) {
  await httpsCallable(functions, "createAlbumItemReportCloudFunction")(req);
}

export default function useCreateAlbumItemReport() {
  return useMutation({
    mutationFn: (req: CreateAlbumItemReportRequest) => createAlbumItemReport(req)
  })
}