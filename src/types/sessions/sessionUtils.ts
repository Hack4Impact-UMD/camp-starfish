import { Session } from "./sessionTypes";
import moment from "moment";

export function getDayNumOfSession(date: string, session: Session) {
  return moment(date).diff(session.startDate, 'days') + 1;
}