import { Moment } from "moment";

export function momentRangesOverlap(range1: [Moment, Moment], range2: [Moment, Moment]): boolean {
  return range1[0].isBefore(range2[1]) && range2[0].isBefore(range1[1]);
}

export function isDayInRange(day: Moment, range: [Moment, Moment]) {
  return range[0].isSameOrBefore(day, 'day') && range[1].isSameOrAfter(day, 'day');
}