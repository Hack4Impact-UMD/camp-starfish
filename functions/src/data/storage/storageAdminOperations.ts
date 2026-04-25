import { adminStorage } from "../../config/firebaseAdminConfig";

export async function deleteFile(path: string) {
  await adminStorage.bucket().file(path).delete();
}