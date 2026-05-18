import { Moment } from "moment";
import { Name, Role } from "../users/userTypes";

export interface Album {
  id: string;
  name: string; // same as Session name if a corresponding Session exists
  numItems: number;
  startDate: Moment | null;
  endDate: Moment | null;
  hasThumbnail: boolean;
  linkedSessionId?: string;
}

export interface AlbumItem {
  id: string;
  albumId: string;
  name: string;
  dateTaken: Moment;
  inReview: boolean;
  tagIds: {
    approved: number[];
    inReview: number[];
  }
}

export type AlbumItemTagStatus = "APPROVED" | "PENDING";

export type PhotoPermissions = "PUBLIC" | "PRIVATE"

export interface UserDirectory {
  page: number;
  [userId: number]: {
    name: Name;
    role: Role;
  };
}

export type AlbumItemReportStatus = 'PENDING' | 'RESOLVED';
interface BaseAlbumItemReport {
  id: string;
  albumItemId: string;
  albumId: string;
  status: AlbumItemReportStatus;

  reporterId: number;
  reportMessage: string;
  reportedAt: Moment;
}

export interface PendingAlbumItemReport extends BaseAlbumItemReport { status: 'PENDING' };
export interface ResolvedAlbumItemReport extends BaseAlbumItemReport {
  status: 'RESOLVED';
  resolverId: number;
  resolutionMessage: string;
  resolvedAt: Moment;
}
export type AlbumItemReport = PendingAlbumItemReport | ResolvedAlbumItemReport;