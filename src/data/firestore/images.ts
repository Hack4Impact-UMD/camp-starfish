import { db } from "@/config/firebase";
import { Image } from "@/types/albumTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

const ALBUMS_COLLECTION = "albums";

export const getImage = async (albumId: string, imageId: string): Promise<Image> => {
    const imageRef = doc(db, ALBUMS_COLLECTION, albumId, "images", imageId);
    const imageDoc = await getDoc(imageRef);
    if (!imageDoc.exists()) {
        throw new Error("Image not found");
    }
    return imageDoc.data() as Image;
}

export const createImage = async (albumID: string, image: Image): Promise<void> => {
    const imageRef = doc(db, ALBUMS_COLLECTION, albumID, "images", image.name);
    try {
        await setDoc(imageRef, image);
    } catch (error: any) {
        throw Error("Image document could not be created")
    }
}

export const updateImage = async (albumId: string, imageId: string, updates: Partial<Image>): Promise<void> => {
    const imageRef = doc(db, ALBUMS_COLLECTION, albumId, "images", imageId);
    try {
        updateDoc(imageRef, updates);
    } catch (error: any) {
        if (error.code === "not-found") {
            throw new Error("Image not found");
        }
    }
}

export const deleteImage = async (albumId: string, imageId: string): Promise<void> => {
    const imageRef = doc(db, ALBUMS_COLLECTION, albumId, "images", imageId);
    await deleteDoc(imageRef);
}