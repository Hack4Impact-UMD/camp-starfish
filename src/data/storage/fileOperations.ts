import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadImage(img: File, path: string) {
  let uploadRef = ref(storage, path);
  await uploadBytes(uploadRef, img);
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
