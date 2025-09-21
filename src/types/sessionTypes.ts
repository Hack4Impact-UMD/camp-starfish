import { Camper, CamperID, Employee, EmployeeID } from "./personTypes";
import { ID } from "./utils";

export interface Session {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
  config: SessionConfig;
  albumId?: string;
}
export interface SessionID extends Session, ID { };

export interface SessionConfig {
  numBlocks: number;
  numBundles: number;
  numJamborees: number;
}

export type CamperAttendee = Pick<
  Camper,
  "name" | "gender" | "dateOfBirth" | "nonoList"
> & {
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
};
export interface CamperAttendeeID extends CamperAttendee, ID { };

export type StaffAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "STAFF";
  programCounselor?: ProgramArea;
  bunk: number;
  leadBunkCounselor: boolean;
}
export interface StaffAttendeeID extends StaffAttendee, ID { };

export type AdminAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "ADMIN",
}

export type SessionSection = CommonSection | SchedulingSection<Block>;
export type SessionSectionID = CommonSectionID | SchedulingSectionID<Block>;

export interface CommonSection {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
}
export interface CommonSectionID extends CommonSection, ID { };

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export interface SchedulingSection<B extends Block> extends CommonSection {
  type: B extends BundleBlock ? "BUNDLE" : B extends BunkJamboreeBlock ? "BUNK-JAMBO" : "NON-BUNK-JAMBO";
  freeplays: { [freeplayId: string]: Freeplay };
  blocks: { [blockId: string]: B };
}
export interface SchedulingSectionID<B extends Block> extends SchedulingSection<B>, ID { };

export type BundleBlock = (BundleActivity & { assignments: IndividualAssignments })[];
export type BunkJamboreeBlock = (JamboreeActivity & { assignments: BunkAssignments })[];
export type NonBunkJamboreeBlock = (JamboreeActivity & { assignments: IndividualAssignments })[];
export type Block = BundleBlock | BunkJamboreeBlock | NonBunkJamboreeBlock;

export type ProgramArea =
  | "ACT" // Activate!
  | "A&C" // Arts & Crafts
  | "ATH" // Athletics
  | "BOAT" // Boating
  | "CHAL" // Challenge
  | "DNC" // Dance
  | "DRA" // Drama
  | "DISC" // Discovery
  | "LC" // Learning Center
  | "MUS" // Music
  | "OUT" // Outdoor Cooking
  | "SMA" // Small Animals
  | "XPL" // Xplore!
  | "OCP" // Teens
  | "WF";  // Waterfront

export interface JamboreeActivity {
  name: string;
  description: string;
}

export interface BundleActivity extends JamboreeActivity {
  programArea: ProgramArea;
  ageGroup: AgeGroup;
}

export interface IndividualAssignments {
  camperIds: number[];
  staffIds: number[];
  adminIds: number[];
}

export interface BunkAssignments {
  bunk: number;
  adminIds: number[];
}

export interface Bunk {
  leadCounselor: number;
  staffIds: number[];
  camperIds: number[];
}
export interface BunkID extends Bunk, ID { };

export interface Freeplay {
  posts: { post: Post, assignments: number[] } // Admin & Staff only
  buddies: Record<number, number[]>; // Staff assigned to 1-2 campers each
}
export interface FreeplayID extends Freeplay, ID { };

export interface Post {
  name: string;
}

export type AgeGroup = 'NAV' | 'OCP';