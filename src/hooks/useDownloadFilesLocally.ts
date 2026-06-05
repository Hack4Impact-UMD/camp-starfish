import { useMutation } from "@tanstack/react-query";
import JSZip from "jszip";

interface DownloadFilesLocallyItem {
  blob: Blob;
  filename: string;
}

interface DownloadFilesLocallyRequest {
  items: DownloadFilesLocallyItem[];
  zipFileName?: string;
}

function downloadFileLocally(item: DownloadFilesLocallyItem): void {
  const { blob, filename } = item;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadFilesLocally(req: DownloadFilesLocallyRequest) {
  const { items, zipFileName } = req;
  if (items.length === 0) {
    throw Error("No files to download");
  } else if (items.length === 1) {
    await downloadFileLocally(items[0]);
  } else {
    const zip = new JSZip();
    for (const item of items) {
      zip.file(item.filename, item.blob);
    }
    const zipFile = await zip.generateAsync({ type: "blob" });
    await downloadFileLocally({
      blob: zipFile,
      filename: zipFileName ?? 'albumItems.zip'
    });
  }
}

export default function useDownloadFilesLocally() {
  return useMutation({
    mutationFn: (req: DownloadFilesLocallyRequest) => downloadFilesLocally(req)
  })
}