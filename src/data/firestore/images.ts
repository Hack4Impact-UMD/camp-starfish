import { db } from "@/config/firebase";
import { Image, ImageMetadata, ImageMetadataID } from "@/types/albumTypes";
import { doc, Transaction, WriteBatch, FirestoreError, FirestoreDataConverter, WithFieldValue, QueryDocumentSnapshot, DocumentReference } from "firebase/firestore";
import { getDoc, createDoc, updateDoc, deleteDoc } from "./firestoreClientOperations"
import { AlbumsSubcollection, Collection } from "./utils";

const imageFirestoreConverter: FirestoreDataConverter<ImageMetadataID, ImageMetadata> = {
  toFirestore: (image: WithFieldValue<ImageMetadataID>): WithFieldValue<ImageMetadata> => {
    const { id, albumId, ...dto } = image;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<ImageMetadata, ImageMetadata>): ImageMetadataID => ({ id: snapshot.ref.id, albumId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getImageById(albumId: string, imageId: string, transaction?: Transaction): Promise<ImageMetadataID> {
  return await getDoc<ImageMetadataID, ImageMetadata>(doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, imageFirestoreConverter, transaction);
}

export async function createImage(albumId: string, imageId: string, image: ImageMetadata, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc(doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, { id: imageId, albumId, ...image }, imageFirestoreConverter, instance);
}

export async function updateImage(albumId: string, imageId: string, updates: Partial<ImageMetadata>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ImageMetadataID, ImageMetadata>(doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, updates, imageFirestoreConverter, instance);
}

export async function deleteImage(albumId: string, imageId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<ImageMetadataID, ImageMetadata>(doc(db, Collection.ALBUMS, albumId, AlbumsSubcollection.IMAGE_METADATAS, imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, imageFirestoreConverter, instance);
}