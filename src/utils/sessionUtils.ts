import { SessionID } from "@/types/sessionTypes";
import moment from "moment";

export function getDayNumOfSession(date: string, session: SessionID) {
  return moment(date).diff(session.startDate, 'days') + 1;
}