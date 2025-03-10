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
  blocks: { [blockName: string]: Block };
}

export type Block = ActivityBlock | FreeplayBlock;

export interface ActivityBlock {

}

export interface FreeplayBlock {

}

export type ActivityCategory = "Arts & Crafts" | "Athletics" | "Learning Center" | "Activate" | "Discovery" | "Martial Arts" | "Boating" | "Drama" // get full list from Lydia

export interface Bunk {
  bunkId: number;
  staffId: number;
  camperIds: number[];
}

