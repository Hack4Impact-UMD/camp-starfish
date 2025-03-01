import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const storage = getStorage();

export async function uploadImage(img: File, path: string) {

    let uploadRef = ref(storage, path);
    await uploadBytes(uploadRef, img);

}

export async function downloadImage(path: string) {

    let downloadRef = ref(storage, path);
    return await getDownloadURL(downloadRef);

}

export async function uploadImages(imgs: File[], paths: string[]) {
    
    let uploadPromises = imgs.map((img, i) => {
        uploadImage(img, paths[i]);
    });

    await Promise.all(uploadPromises);

}

export async function downloadImages(paths: string[]) {

    let downloadPromises = paths.map((path) => {
        downloadImage(path);
    });

    return await Promise.all(downloadPromises);
}
