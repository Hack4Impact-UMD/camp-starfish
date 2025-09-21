import { Camper, Employee } from "./personTypes";
import { ID } from "./utils";

export interface Session {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  schedule: SessionSection[];
  config: SessionConfig;
  attendees: {
    campers: CamperSessionAttendee[];
    staff: StaffSessionAttendee[];
    admins: (Pick<Employee, 'campminderId' | 'name' | 'gender' | 'nonoList'> & { role: "ADMIN" })[];
  };
  albumId?: string;
}
export interface SessionID extends Session, ID { };

export interface SessionConfig {
  numBlocks: number;
  numBundles: number;
  numJamborees: number;
}

export type CamperSessionAttendee = Pick<
  Camper,
  "campminderId" | "name" | "gender" | "dateOfBirth" | "nonoList"
> & {
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
  prefs: {
    bundles: {
      [bundleId: string]: {
        [blockId: string]: { [activityId: string]: number };
      };
    };
    nonBunkJamborees: {
      [jamboId: string]: {
        [blockId: string]: { [activityId: string]: number };
      };
    };
  };
};

export type StaffSessionAttendee = Pick<Employee, 'campminderId' | 'name' | 'gender' | 'nonoList'> & {
  role: "STAFF";
  programCounselor?: ProgramArea;
  bunk: number;
}

export type SessionSection = CommonSection | SchedulingSection<Block>;

export interface CommonSection {
  id: string;
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export interface SchedulingSection<B extends Block> extends CommonSection {
  type: B extends BundleBlock ? "BUNDLE" : B extends BunkJamboreeBlock ? "BUNK-JAMBO" : "NON-BUNK-JAMBO";
  freeplays: { [freeplayId: string]: Freeplay };
  blocks: { [blockId: string]: B };
}

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
  bunkNum: number;
  leadCounselor: number;
  staffIds: number[];
  camperIds: number[];
  bunkJamboreePrefs: {
    [jamboId: string]: {
      [blockId: string]: { [activityId: string]: number };
    };
  };
}

export interface Freeplay {
  posts: Record<Post, number[]> // Admin & Staff only
  buddies: Record<number, number[]>; // Staff assigned to 1-2 campers each
}

export type Post =
  | "Wishy Washy"
  | "Lily Pads"
  | "Book Nook"
  | "Camp Store"
  | "Blacktop"
  | "Waterfront"
  | "Fort Starfish"
  | "Teens Lounge"
  | "Truckstop"
  | "Field";

export type AgeGroup = 'NAV' | 'OCP';