export interface Album {
  id: string;
  name: string; // same as Session name if a corresponding Session exists
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  hasThumbnail: boolean;
  numItems: number;
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

export type ReportStatus = 'PENDING' | 'RESOLVED';

export interface ImageReport {
  reporterId: number; // Parent ID
  reason: string;
  status: ReportStatus;
  reportedAt: string; // ISO-8601
  resolvedAt?: string; // ISO-8601, optional
  resolvedBy?: number; // Admin ID, optional
}

export interface ImageReportID extends ImageReport, ID<string> { imageId: string; albumId: string; }