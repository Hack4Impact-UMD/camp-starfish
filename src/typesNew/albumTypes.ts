import { Moment } from "moment";

export interface Album {
  id: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
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
  tagIds: number[];
}

export type PhotoPermissions = "PUBLIC" | "PRIVATE"