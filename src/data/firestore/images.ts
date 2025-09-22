import { db } from "@/config/firebase";
import { ImageMetadata, ImageMetadataID } from "@/types/albumTypes";
import { WriteBatch } from "@google-cloud/firestore";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Transaction } from "firebase/firestore";
import { AlbumsSubcollection, Collection } from "./utils";

export const getImage = async (albumId: string, imageId: string, transaction?: Transaction): Promise<ImageMetadataID> => {
    const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGES, imageId);
    let imageDoc;
    try {
        imageDoc = await (transaction ? transaction.get(imageRef) : getDoc(imageRef));
    } catch (error: any) {
        throw new Error(`Failed to get image: ${error.code}`);
    }
    if (!imageDoc.exists()) {
        throw new Error("Image not found");
    }
    return {
        id: imageDoc.id,
        albumId: imageDoc.ref.parent.parent!.id,
        ...imageDoc.data()
    } as ImageMetadataID;
}

export const createImage = async (albumId: string, imageId: string, image: ImageMetadata, instance?: Transaction | WriteBatch): Promise<void> => {
    try {
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGES, imageId);
        // @ts-ignore
        await (instance ? instance.set(imageRef, image) : setDoc(imageRef, image));
    } catch (error: any) {
        throw new Error(`Failed to create image: ${error.code}`);
    }
}

export const updateImage = async (albumId: string, imageId: string, updates: Partial<ImageMetadata>, instance?: Transaction | WriteBatch): Promise<void> => {
    try {
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGES, imageId);
        // @ts-ignore
        await (instance ? instance.update(imageRef, updates) : updateDoc(imageRef, updates));
    } catch (error: any) {
        if (error.code === "not-found") {
            throw new Error("Image not found");
        }
        throw new Error(`Failed to update image: ${error.code}`);
    }
}

export const deleteImage = async (albumId: string, imageId: string, instance?: Transaction | WriteBatch): Promise<void> => {
    try {
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGES, imageId);
        // @ts-ignore
        await (instance ? instance.delete(imageRef) : deleteDoc(imageRef));
    } catch (error: any) {
        throw new Error(`Failed to delete image: ${error.code}`);
    }
}