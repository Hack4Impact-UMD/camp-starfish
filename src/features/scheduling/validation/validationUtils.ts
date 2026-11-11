import { getAttendeeName } from "@/features/scheduling/generation/schedulingUtils";
import {
  Attendee,
  CounselorAttendee,
  DaysOffSchedule,
  Section,
} from "@/types/sessions/sessionTypes";
import { isDayInRange } from "@/utils/timeUtils";
import { Moment } from "moment";

export function pairKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function relationshipPairs(counselors: CounselorAttendee[]): [number, number][] {
  const counselorIds = new Set(counselors.map((counselor) => counselor.attendeeId));
  const seen = new Set<string>();
  const pairs: [number, number][] = [];

  for (const counselor of counselors) {
    for (const otherId of counselor.snapshot.yesyesList) {
      if (otherId === counselor.attendeeId || !counselorIds.has(otherId)) {
        continue;
      }

      const key = pairKey(counselor.attendeeId, otherId);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      pairs.push(counselor.attendeeId < otherId ? [counselor.attendeeId, otherId] : [otherId, counselor.attendeeId]);
    }
  }

  return pairs;
}

export function sectionDays(section: Pick<Section, "startDate" | "endDate">): Moment[] {
  const days: Moment[] = [];

  for (let cursor = section.startDate.clone().startOf("day"); cursor.isSameOrBefore(section.endDate, "day"); cursor = cursor.clone().add(1, "day")) {
    days.push(cursor.clone());
  }

  return days;
}

export function dayOffsDuringSection(counselorId: number, daysOffSchedule: DaysOffSchedule | undefined, section: Pick<Section, "startDate" | "endDate"> | undefined): Moment[] {
  if (!daysOffSchedule || !section) {
    return [];
  }

  return (daysOffSchedule.daysOffByCounselorId[counselorId] ?? []).filter((dayOff) => isDayInRange(dayOff, [section.startDate, section.endDate]));
}

export function isOffEntireSection(counselorId: number, daysOffSchedule: DaysOffSchedule | undefined, section: Pick<Section, "startDate" | "endDate"> | undefined): boolean {
  if (!daysOffSchedule || !section) {
    return false;
  }

  const daysOff = dayOffsDuringSection(counselorId, daysOffSchedule, section);

  return sectionDays(section).every((day) => daysOff.some((dayOff) => dayOff.isSame(day, "day")));
}

export function isCounselorOffOnDate(counselorId: number, date: Moment, daysOffSchedule: DaysOffSchedule): boolean {
  const isSessionDayOff = daysOffSchedule.daysOffInSession.some((dayOff) => dayOff.isSame(date, "day"));

  if (!isSessionDayOff) {
    return false;
  }

  return (daysOffSchedule.daysOffByCounselorId[counselorId] ?? []).some((dayOff) => dayOff.isSame(date, "day"));
}

export function namesOf(attendeesById: Record<number, Attendee>, attendeeIds: number[]): string {
  return attendeeIds.map((attendeeId) => getAttendeeName(attendeesById, attendeeId)).join(", ");
}

export function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)];
}
