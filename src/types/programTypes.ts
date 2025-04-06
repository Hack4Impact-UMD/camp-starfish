export interface Session {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  schedule: SessionSection[];
}

export type SessionSection = CommonSection | SchedulingSection;

export interface CommonSection {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export interface SchedulingSection extends CommonSection {
  type: SchedulingSectionType;
  freeplays: { [freeplayId: string]: Freeplay };
  blocks: { [blockId: string]: Activity[] };
}

export type ActivityCategory =
  | "ACT" // Activate!
  | "A&C" // Arts & Crafts
  | "ATH" // Athletics
  | "BOAT"  // Boating
  | "CHAL"  // Challenge
  | "DNC"  // Dance
  | "DRA"  // Drama
  | "DISC"  // Discovery
  | "LC"  // Learning Center
  | "MUS"  // Music
  | "OUT"  // Outdoor Cooking
  | "SMA"  // Small Animals
  | "XPL"  // Xplore!
  | "OCP"  // Teens
  | "WF";  // Waterfront

export interface Activity {
  name: string;
  description: string;
  category?: ActivityCategory; // included only in Bundle activities
  ageGroup?: AgeGroup; // included only in Bundle activities
  assignments: {
    campers: number[];
    staff: number[];
    admin: number[];
  }
}

export interface ActivityAssignments {
  admin: number[];
}

export interface Bunk {
  bunkNum: number;
  staffIds: number[];
  camperIds: number[];
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