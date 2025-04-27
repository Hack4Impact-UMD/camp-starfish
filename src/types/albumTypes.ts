import { Camper } from "./personTypes";

export interface Album {
  name: string; // same as Session name if a corresponding Session exists
  sessionId?: string;
  numPhotos: number;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
}

export interface ImageMetadata {
  name: string;
  dateTaken: string; // ISO-8601
  inReview: boolean;
  tags: ImageTags;
}
export interface Image extends ImageMetadata {
  src: string;
}

// 'ALL' indicates an image should be available to everyone associated with that session (ex. group photos)
export type ImageTags = 'ALL' | {
  approved: Pick<Camper, 'campminderId' | 'name' | 'photoPermissions'>[];
  inReview: Pick<Camper, 'campminderId' | 'name' | 'photoPermissions'>[];
}

// Permissions for sharing photos with a given child in them
// PUBLIC: photo can be used online in promotional materials
// INTERNAL: photo can not be used publicly, but other Camp Starfish parents can see it if their child is also in the photo
// PRIVATE: only the child's parents can see the photo
export type PhotoPermissions = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';