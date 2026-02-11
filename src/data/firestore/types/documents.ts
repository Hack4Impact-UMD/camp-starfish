import { Album, AlbumItem } from "@/types/albums/albumTypes";
import { ProgramArea, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Attendee, Bunk, Freeplay, NightSchedule, Post, Section, Session } from "@/types/sessions/sessionTypes";
import { User } from "@/types/users/userTypes";
import { DistributiveOmit } from "@/utils/types/typeUtils";

export type AlbumDoc = Omit<Album, "id">;
export type AlbumItemDoc = Omit<AlbumItem, "id" | "albumId">;

export type UserDoc = DistributiveOmit<User, "id">;

export type SessionDoc = Omit<Session, "id">;
export type AttendeeDoc = DistributiveOmit<Attendee, "sessionId" | "attendeeId">;
export type SectionDoc = DistributiveOmit<Section, "id" | "sessionId">;
export type SectionScheduleDoc = DistributiveOmit<SectionSchedule, "sessionId" | "sectionId">;
export type BunkDoc = Omit<Bunk, "bunkNum" | "sessionId">;
export type NightScheduleDoc = Omit<NightSchedule, "date" | "sessionId">;
export type FreeplayDoc = Omit<Freeplay, "date" | "sessionId">;

export type ProgramAreaDoc = Omit<ProgramArea, "id">;
export type PostDoc = Omit<Post, "id">;