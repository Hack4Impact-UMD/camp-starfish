import { storage } from "@/config/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export interface UploadFileItem {
  file: File;
  path: string;
}

export async function uploadFile(file: File, path: string) {
  const uploadRef = ref(storage, path);
  await uploadBytes(uploadRef, file);
}

export async function uploadFiles(items: UploadFileItem[]) {
  const uploadPromises = items.map(({ file, path }) => uploadFile(file, path));
  await Promise.all(uploadPromises);
}

export async function deleteFile(path: string) {
  const deleteRef = ref(storage, path);
  await deleteObject(deleteRef);
}

export async function getFileURL(path: string) {
  const downloadRef = ref(storage, path);
  return await getDownloadURL(downloadRef);
}

export async function getFileURLs(paths: string[]) {
  const downloadPromises = paths.map((path) => getFileURL(path));
  return await Promise.all(downloadPromises);
}

export async function downloadImage(storagePath: string, fileName: string) {
  const url = await getFileURL(storagePath);
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
