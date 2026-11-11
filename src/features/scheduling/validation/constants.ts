/** Bundle activities should have 4-9 campers, ideally 5-8. */
export const ACTIVITY_CAMPER_LIMITS = {
  min: 4,
  idealMin: 5,
  idealMax: 8,
  max: 9,
} as const;

/** Staffing should stay within one person of a 1:1 counselor-to-camper ratio. */
export const MAX_STAFFING_IMBALANCE = 1;

export const SWIM_PROGRAM_AREA_ID = "WF";
export const OCP_CHAT_PROGRAM_AREA_ID = "OCP";

/** Navigators swim once per bundle, during blocks C-E. */
export const NAV_SWIM_BLOCK_IDS = ["C", "D", "E"] as const;
/** OCP swim uses A-B; after bundle one only levels 4–5 may opt out. */
export const OCP_SWIM_BLOCK_IDS = ["A", "B"] as const;
/** OCP chat replaces one activity in blocks C-E. */
export const OCP_CHAT_BLOCK_IDS = ["C", "D", "E"] as const;

export const MIN_COUNSELORS_ON_DUTY = 2;
export const MIN_NIGHT_BUNK_DUTY = 2;
