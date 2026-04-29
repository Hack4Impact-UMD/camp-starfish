import { useMutation } from "@tanstack/react-query";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";

interface DownloadFilesLocallyRequest {
  files: Blob[];
}

function downloadFileLocally(file: Blob, filename: string): void
function downloadFileLocally(file: File): void
function downloadFileLocally(file: File | Blob, filename?: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file instanceof File ? file.name : filename!;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadFilesLocally(req: DownloadFilesLocallyRequest) {
  const { files } = req;
  if (files.length === 0) {
    throw Error("No files to download");
  } else if (files.length === 1) {
    await downloadFileLocally(files[0], uuidv4());
  } else {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(uuidv4(), file);
    }
    const zipFile = await zip.generateAsync({ type: "blob" });
    await downloadFileLocally(zipFile, 'images.zip');
  }
}

export default function useDownloadFilesLocally() {
  return useMutation({
    mutationFn: (req: DownloadFilesLocallyRequest) => downloadFilesLocally(req)
  })
}