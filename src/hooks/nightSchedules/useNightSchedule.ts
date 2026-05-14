import { getNightScheduleDoc } from "@/data/firestore/nightSchedules";
import { skipToken, useQuery } from "@tanstack/react-query";
import { Moment } from "moment";

export default function useNightSchedule(sessionId: string, date: Moment | undefined) {
  const dateStr = date?.format("YYYY-MM-DD");
  return useQuery({
    queryKey: ["sessions", sessionId, "nightSchedules", dateStr],
    queryFn: date ? (() => getNightScheduleDoc(date, sessionId)) : skipToken,
  });
}