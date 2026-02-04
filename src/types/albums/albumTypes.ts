export interface Album {
  id: string;
  name: string; // same as Session name if a corresponding Session exists
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  hasThumbnail: boolean;
  numPhotos: number;
  linkedSessionId?: string;
}

export interface AlbumItem {
  id: string;
  src: string;
  albumId: string;
  name: string;
  dateTaken: string; // ISO-8601
  inReview: boolean;
  tagIds: {
    approved: number[];
    inReview: number[];
  }
}

export type PhotoPermissions = "PUBLIC" | "PRIVATE"