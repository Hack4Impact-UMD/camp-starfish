import { adminDb } from "../../config/firebaseAdminConfig";
import { ImageMetadata, ImageMetadataID } from "@/types/albumTypes";
import { Transaction, WriteBatch, FirestoreDataConverter, WithFieldValue, QueryDocumentSnapshot, DocumentReference } from "firebase-admin/firestore";
import { getDoc, createDoc, updateDoc, deleteDoc } from "./firestoreAdminOperations"
import { Collection } from "./utils";
import { AlbumsSubcollection } from "@/data/firestore/utils";

const imageFirestoreConverter: FirestoreDataConverter<ImageMetadataID, ImageMetadata> = {
  toFirestore: (image: WithFieldValue<ImageMetadataID>): WithFieldValue<ImageMetadata> => {
    const { id, albumId, ...dto } = image;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<ImageMetadata, ImageMetadata>): ImageMetadataID => ({ id: snapshot.ref.id, albumId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getImageById(albumId: string, imageId: string, transaction?: Transaction): Promise<ImageMetadataID> {
  return await getDoc<ImageMetadataID, ImageMetadata>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.IMAGE_METADATAS).doc(imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, imageFirestoreConverter, transaction);
}

export async function createImage(albumId: string, imageId: string, image: ImageMetadata, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.IMAGE_METADATAS).doc(imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, { id: imageId, albumId, ...image }, imageFirestoreConverter, instance);
}

export async function updateImage(albumId: string, imageId: string, updates: Partial<ImageMetadata>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ImageMetadataID, ImageMetadata>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.IMAGE_METADATAS).doc(imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, updates, imageFirestoreConverter, instance);
}

export async function deleteImage(albumId: string, imageId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<ImageMetadataID, ImageMetadata>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.IMAGE_METADATAS).doc(imageId) as DocumentReference<ImageMetadataID, ImageMetadata>, imageFirestoreConverter, instance);
}