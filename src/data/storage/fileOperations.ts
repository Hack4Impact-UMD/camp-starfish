import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes, getBytes } from "firebase/storage";

export async function uploadImage(img: File, path: string) {
  let uploadRef = ref(storage, path);
  await uploadBytes(uploadRef, img);
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

export async function getImageURL(path: string) {
  let downloadRef = ref(storage, path);
  return await getDownloadURL(downloadRef);
}

export async function uploadImages(imgs: File[], paths: string[]) {
  if (imgs.length !== paths.length) {
    throw new Error("Number of images must be equal to the number of paths");
  }
  let uploadPromises = imgs.map((img, i) => {
    return uploadImage(img, paths[i]);
  });

  await Promise.all(uploadPromises);
}

export async function getImageURLs(paths: string[]) {
  let downloadPromises = paths.map((path) => getImageURL(path));
  return await Promise.all(downloadPromises);
}
