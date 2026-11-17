import { isMoment } from "moment";
import { Moment } from "moment";
import z from "zod";

export function momentRangesOverlap(range1: [Moment, Moment], range2: [Moment, Moment]): boolean {
  return range1[0].isBefore(range2[1]) && range2[0].isBefore(range1[1]);
}

export function isDayInRange(day: Moment, range: [Moment, Moment]) {
  return range[0].isSameOrBefore(day, 'day') && range[1].isSameOrAfter(day, 'day');
}

export const TimeOnlyMomentSchema = z.custom<Moment>((obj: unknown) => isMoment(obj) && obj.isValid() && obj.year() === 1970 && obj.month() === 1 && obj.day() === 1).brand("TimeOnlyMoment");
export type TimeOnlyMoment = z.infer<typeof TimeOnlyMomentSchema>;
export function asTimeOnlyMoment(moment: Moment): TimeOnlyMoment {
  return TimeOnlyMomentSchema.parse(moment.clone().set({
    year: 1970,
    month: 1,
    day: 1
  }));
}