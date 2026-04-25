import { storage } from "@/config/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface UploadFileItem {
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
