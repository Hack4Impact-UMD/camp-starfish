import { CamperID } from "./personTypes";
import { ID } from "./utils";

export interface Album {
  name: string; // same as Session name if a corresponding Session exists
  sessionId?: string;
  numPhotos: number;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  hasThumbnail: boolean;
}
export interface AlbumID extends Album, ID { };

export interface ImageMetadata {
  name: string;
  dateTaken: string; // ISO-8601
  inReview: boolean;
  tags: ImageTags;
}
export interface ImageMetadataID extends ImageMetadata, ID { albumId: string };

export interface Image extends ImageMetadata {
  src: string;
}
export interface ImageID extends Image, ID { albumId: string };

// 'ALL' indicates an image should be available to everyone associated with that session (ex. group photos)
export type ImageTags = 'ALL' | {
  approved: Pick<CamperID, 'id' | 'name' | 'photoPermissions'>[];
  inReview: Pick<CamperID, 'id' | 'name' | 'photoPermissions'>[];
}

// Permissions for sharing photos with a given child in them
// PUBLIC: photo can be used online in promotional materials
// INTERNAL: photo can not be used publicly, but other Camp Starfish parents can see it if their child is also in the photo
// PRIVATE: only the child's parents can see the photo
export type PhotoPermissions = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';