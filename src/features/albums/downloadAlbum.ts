import JSZip from "jszip";
import { getAlbumItemDocs } from "@/data/firestore/albumItems";
import { getFileURL } from "@/data/storage/storageClientOperations";
import { Album, AlbumItem } from "@/types/albums/albumTypes";

const DOWNLOAD_CONCURRENCY = 6;

export interface DownloadAlbumProgress {
  total: number;
  completed: number;
}

interface DownloadAlbumOptions {
  onProgress?: (progress: DownloadAlbumProgress) => void;
}

function albumItemStoragePath(albumId: string, albumItemId: string) {
  return `albums/${albumId}/albumItems/${albumItemId}`;
}

function inferExtension(blob: Blob, fallbackName: string): string {
  const fromName = fallbackName.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName;
  const subtype = blob.type.split("/")[1];
  return subtype ? `.${subtype}` : "";
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "album";
}

async function fetchItemAsBlob(albumId: string, item: AlbumItem): Promise<{ name: string; blob: Blob }> {
  const url = await getFileURL(albumItemStoragePath(albumId, item.id));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${item.id}: ${response.status}`);
  }
  const blob = await response.blob();
  const ext = inferExtension(blob, item.name);
  const baseName = safeFileName(item.name).replace(/\.[a-z0-9]+$/i, "") || item.id;
  return { name: `${baseName}${ext}`, blob };
}

async function processInBatches<T, R>(items: T[], batchSize: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }
  return results;
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadAlbum(album: Album, options: DownloadAlbumOptions = {}): Promise<void> {
  const { onProgress } = options;
  const { docs: items } = await getAlbumItemDocs(album.id);
  if (items.length === 0) {
    throw new Error("This album has no items to download.");
  }

  const zip = new JSZip();
  const usedNames = new Map<string, number>();
  let completed = 0;
  onProgress?.({ total: items.length, completed });

  await processInBatches(items, DOWNLOAD_CONCURRENCY, async (item) => {
    const { name, blob } = await fetchItemAsBlob(album.id, item);
    const count = usedNames.get(name) ?? 0;
    const finalName = count === 0 ? name : name.replace(/(\.[^.]*)?$/, (match) => `_${count}${match}`);
    usedNames.set(name, count + 1);
    zip.file(finalName, blob);
    completed += 1;
    onProgress?.({ total: items.length, completed });
  });

  const archive = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(archive, `${safeFileName(album.name)}.zip`);
}
