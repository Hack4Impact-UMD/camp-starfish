import { isMoment } from "moment";
import { Moment } from "moment";
import z from "zod";

export function momentRangesOverlap(range1: [Moment, Moment], range2: [Moment, Moment]): boolean {
  return range1[0].isBefore(range2[1]) && range2[0].isBefore(range1[1]);
}

export function isDayInRange(day: Moment, range: [Moment, Moment]) {
  return range[0].isSameOrBefore(day, 'day') && range[1].isSameOrAfter(day, 'day');
}

export const TimeOnlyMomentSchema = z.custom<Moment>((obj: unknown) => isMoment(obj) && obj.isValid() && obj.year() === 1970 && obj.month() === 0 && obj.date() === 1).brand("TimeOnlyMoment");
export type TimeOnlyMoment = z.infer<typeof TimeOnlyMomentSchema>;
export function asTimeOnlyMoment(moment: Moment): TimeOnlyMoment {
  return TimeOnlyMomentSchema.parse(moment.clone().set({
    year: 1970,
    month: 0,
    date: 1
  }));
}
export function isTimeOnlyMoment(moment: Moment): moment is TimeOnlyMoment {
  return TimeOnlyMomentSchema.safeParse(moment).success;
}

export const hoursMinutesRegex = /([01]\d|2[0-3]):[0-5]\d/;