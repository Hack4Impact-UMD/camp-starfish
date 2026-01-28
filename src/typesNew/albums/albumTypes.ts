export interface Album {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  hasThumbnail: boolean;
  numPhotos: number;
  linkedSessionId?: string;
}

export interface Image {
  id: string;
  albumId: string;
  name: string;
  dateTaken: string;
  inReview: boolean;
  tagIds: {
    approved: number[];
    inReview: number[];
  }
}

export type PhotoPermissions = "PUBLIC" | "PRIVATE"