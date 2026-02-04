import { SessionID } from "@/types/sessions/sessionTypes";
import moment from "moment";

export function getDayNumOfSession(date: string, session: SessionID) {
  return moment(date).diff(session.startDate, 'days') + 1;
}