import { storage } from "@/config/firebase";
import { CampStarfishError } from "@/utils/errors/CampStarfishErrors";
import { InvalidArgumentsError } from "@/utils/errors/InvalidArgumentsError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadFile(file: File, path: string) {
  const uploadRef = ref(storage, path);
  await uploadBytes(uploadRef, file);
}

export async function uploadFiles(files: File[], paths: string[]) {
  if (files.length !== paths.length) {
    throw new InvalidArgumentsError("Files and paths must have the same length");
  }
  const uploadPromises = files.map((file, i) => {
    return uploadFile(file, paths[i]);
  });

  await Promise.all(uploadPromises);
}

export async function getFileURL(path: string) {
  const downloadRef = ref(storage, path);
  return await getDownloadURL(downloadRef);
}

export async function getFileURLs(paths: string[]) {
  const downloadPromises = paths.map((path) => getFileURL(path));
  return await Promise.all(downloadPromises);
}
