import { Album, AlbumItem } from "@/types/albums/albumTypes";
import { ProgramArea, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Attendee, Bunk, Freeplay, NightSchedule, Post, Section, Session } from "@/types/sessions/sessionTypes";
import { User } from "@/types/users/userTypes";

export type AlbumDoc = Omit<Album, "id">;
export type AlbumItemDoc = Omit<AlbumItem, "id" | "albumId">;

export type UserDoc = Omit<User, "id">;

export type SessionDoc = Omit<Session, "id">;
export type AttendeeDoc = Omit<Attendee, "sessionId" | "attendeeId">;
export type SectionDoc = Omit<Section, "id" | "sessionId">;
export type SectionScheduleDoc = Omit<SectionSchedule, "id" | "sessionId">;
export type BunkDoc = Omit<Bunk, "bunkNum" | "sessionId">;
export type NightScheduleDoc = Omit<NightSchedule, "date" | "sessionId">;
export type FreeplayDoc = Omit<Freeplay, "date" | "sessionId">;

export type ProgramAreaDoc = Omit<ProgramArea, "id">;
export type PostDoc = Omit<Post, "id">;