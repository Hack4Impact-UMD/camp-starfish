export interface Program {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  schedule: ProgramSection[];
}

export type ProgramSection = CommonSection | SchedulingSection;

export interface CommonSection {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export interface SchedulingSection extends CommonSection {
  type: SchedulingSectionType;
  freeplays: { [freeplayName: string]: Freeplay };
  blocks: { [blockName: string]: ActivityBlock };
}

export interface ActivityBlock {

}

export interface Freeplay {
  
}

export type ActivityCategory = "Arts & Crafts" | "Athletics" | "Learning Center" | "Activate" | "Discovery" | "Martial Arts" | "Boating" | "Drama" // get full list from Lydia

export interface Bunk {
  bunkId: number;
  staffIds: number[];
  camperIds: number[];
}

