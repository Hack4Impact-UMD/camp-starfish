import { NightSchedulePosition } from "@/types/sessionTypes";

export const nightSchedulePositions: NightSchedulePosition[] = ["COUNSELOR-ON-DUTY", "NIGHT-BUNK-DUTY", "ROVER"];

export function getNightSchedulePositionFullName(nightSchedulePosition: NightSchedulePosition): string {
  return {
    "COUNSELOR-ON-DUTY": "Counselor on Duty",
    "NIGHT-BUNK-DUTY": "Night Bunk Duty",
    ROVER: "Rover",
  }[nightSchedulePosition];
}

export function getNightSchedulePositionAbbreviation(nightScheudlePosition: NightSchedulePosition): string {
  return {
    "COUNSELOR-ON-DUTY": "COD",
    "NIGHT-BUNK-DUTY": "NBD",
    ROVER: "ROVER",
  }[nightScheudlePosition];
}