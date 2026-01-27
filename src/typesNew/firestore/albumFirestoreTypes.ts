import { Timestamp } from "firebase/firestore";

export interface PublicAlbumDoc {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  hasThumbnail: boolean;
}
export interface InternalAlbumDoc {
  numPhotos: number;
  linkedSessionId?: string;
}

export interface PublicImageDoc {
  name: string;
  dateTaken: Timestamp;
}
export interface InternalImageDoc {
  inReview: boolean;
  tagIds: number[];
}