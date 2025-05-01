import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes, getBytes } from "firebase/storage";

export async function uploadFile(file: File, path: string) {
  let uploadRef = ref(storage, path);
  await uploadBytes(uploadRef, file);
}

export async function uploadFiles(files: File[], paths: string[]) {
  if (files.length !== paths.length) {
    
    throw new Error("Number of images must be equal to the number of paths");
  }
  let uploadPromises = files.map((file, i) => {
    return uploadFile(file, paths[i]);
  });

  await Promise.all(uploadPromises);
}

export async function downloadImage(path: string, filename: string) {
  const fileRef = ref(storage, path);
  const bytes = await getBytes(fileRef);
  const blob = new Blob([bytes]);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export async function getFileURL(path: string) {
  let downloadRef = ref(storage, path);
  return await getDownloadURL(downloadRef);
}

export async function getFileURLs(paths: string[]) {
  let downloadPromises = paths.map((path) => getFileURL(path));
  return await Promise.all(downloadPromises);
}
