export interface Program {
  bundles: Bundle[];

}

export interface Bundle {
  blocks: Block[];
}

export interface Block {
  activities: Activity[];
}

export interface Activity {
  name: string;
  category: ActivityCategory;
}

export type ActivityCategory = "Arts & Crafts" | "Athletics" | "Learning Center" | "Activate" | "Discovery" | "Martial Arts" | "Boating" | "Drama" | 