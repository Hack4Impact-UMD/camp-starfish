import { db } from "@/config/firebase";
import { ImageMetadata, ImageMetadataID } from "@/types/albumTypes";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Transaction, WriteBatch, FirestoreError } from "firebase/firestore";
import { AlbumsSubcollection, Collection } from "./utils";

export const getImage = async (albumId: string, imageId: string, transaction?: Transaction): Promise<ImageMetadataID> => {
    const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId);
    let imageDoc;
    try {
        imageDoc = await (transaction ? transaction.get(imageRef) : getDoc(imageRef));
    } catch {
        throw new Error(`Failed to get image`);
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
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId);
        // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
        await (instance ? instance.set(imageRef, image) : setDoc(imageRef, image));
    } catch (error: unknown) {
        if (error instanceof FirestoreError && error.code === "already-exists") {
            throw new Error("Image already exists");
        }
        throw new Error(`Failed to create image`);
    }
}

export const updateImage = async (albumId: string, imageId: string, updates: Partial<ImageMetadata>, instance?: Transaction | WriteBatch): Promise<void> => {
    try {
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId);
        // @ts-expect-error - instance.update on both Transaction and WriteBatch have the same signature
        await (instance ? instance.update(imageRef, updates) : updateDoc(imageRef, updates));
    } catch (error: unknown) {
        if (error instanceof FirestoreError && error.code === "not-found") {
            throw new Error("Image not found");
        }
        throw new Error(`Failed to update image`);
    }
}

export const deleteImage = async (albumId: string, imageId: string, instance?: Transaction | WriteBatch): Promise<void> => {
    try {
        const imageRef = doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId);
        await (instance ? instance.delete(imageRef) : deleteDoc(imageRef));
    } catch {
        throw new Error(`Failed to delete image`);
    }
}