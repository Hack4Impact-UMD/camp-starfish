import { AlbumItemReportStatus } from "@/types/albums/albumTypes";
import { ProgramArea, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Attendee, Bunk, Freeplay, NightSchedule, Post, SchedulingSectionType, Section, SectionType, Session } from "@/types/sessions/sessionTypes";
import { User } from "@/types/users/userTypes";
import { DistributiveOmit } from "@/utils/types/typeUtils";
import { Timestamp } from "firebase/firestore";

export interface AlbumDoc {
  name: string;
  numItems: number;
  startDate?: Timestamp | null;
  endDate?: Timestamp | null;
  hasThumbnail: boolean;
  linkedSessionId?: string;
}

export interface AlbumItemDoc {
  name: string;
  dateTaken: Timestamp;
  inReview: boolean;
  tagIds: {
    approved: number[];
    inReview: number[];
  }
}

export interface TagDirectoryDoc { [userId: number]: string; }

interface BaseAlbumItemReportDoc {
  status: AlbumItemReportStatus;
  reporterId: number;
  reportMessage: string;
  reportedAt: Timestamp;
}
export interface PendingAlbumItemReportDoc extends BaseAlbumItemReportDoc { status: "PENDING" };
export interface ResolvedAlbumItemReportDoc extends BaseAlbumItemReportDoc {
  status: "RESOLVED";
  resolverId: number;
  resolutionMessage: string;
  resolvedAt: Timestamp;
};
export type AlbumItemReportDoc = PendingAlbumItemReportDoc | ResolvedAlbumItemReportDoc;

export type UserDoc = DistributiveOmit<User, "id">;

export interface SessionDoc {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  linkedAlbumId?: string;
  driveFolderId: string;
}

interface BaseSectionDoc {
  name: string;
  type: SectionType;
  startDate: Timestamp;
  endDate: Timestamp;
}
export interface CommonSectionDoc extends BaseSectionDoc { type: "COMMON" };
export interface SchedulingSectionDoc extends BaseSectionDoc {
  type: SchedulingSectionType;
  publishedAt: Timestamp | null;
}
export type SectionDoc = CommonSectionDoc | SchedulingSectionDoc;

export type AttendeeDoc = DistributiveOmit<Attendee, "sessionId" | "attendeeId">;
export type SectionScheduleDoc = DistributiveOmit<SectionSchedule, "sessionId" | "sectionId">;
export type BunkDoc = Omit<Bunk, "bunkNum" | "sessionId">;
export type NightScheduleDoc = Omit<NightSchedule, "date" | "sessionId">;
export type FreeplayDoc = Omit<Freeplay, "date" | "sessionId">;

export type ProgramAreaDoc = Omit<ProgramArea, "id">;
export type PostDoc = Omit<Post, "id">;