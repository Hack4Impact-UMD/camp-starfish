import { NightSchedulePosition } from "@/types/sessionTypes";

export const nightSchedulePositions: NightSchedulePosition[] = ["COUNSELOR-ON-DUTY", "NIGHT-BUNK-DUTY", "ROVER", "DAY OFF"];

export function getNightSchedulePositionFullName(nightSchedulePosition: NightSchedulePosition): string {
  return {
    "COUNSELOR-ON-DUTY": "Counselor on Duty",
    "NIGHT-BUNK-DUTY": "Night Bunk Duty",
    ROVER: "Rover",
    "DAY OFF": "Day Off",
  }[nightSchedulePosition];
}

export function getNightSchedulePositionAbbreviation(nightScheudlePosition: NightSchedulePosition): string {
  return {
    "COUNSELOR-ON-DUTY": "COD",
    "NIGHT-BUNK-DUTY": "NBD",
    ROVER: "ROVER",
    "DAY OFF": "DO",
  }[nightScheudlePosition];
}