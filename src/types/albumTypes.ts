export interface Album {
  name: string; // same as Program name if a corresponding Program exists
  programId: string | null;

  numPhotos: number;
  nextPhotoId: number;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
}

export interface ImageMetadata {
  takenDate: string; // ISO-8601
  inReview: boolean;
  tags: {
    approved: number[]; // camperIds
    inReview: number[]; // camperIds
  }
}

// Permissions for sharing photos with a given child in them
// PUBLIC: photo can be used online in promotional materials
// INTERNAL: photo can not be used publicly, but other Camp Starfish parents can see it if their child is also in the photo
// PRIVATE: only the child's parents can see the photo
export type PhotoPermissions = 'PUBLIC' | 'INTERNAL' | 'PRIVATE';