import { sectionQueryOptions } from "@/hooks/sections/useSection";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { generateBundleSchedule } from "../generateBundleSchedule";
import { BundleSectionSchedule, BunkJamboreeSectionSchedule, NonBunkJamboreeSectionSchedule, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { generateBunkJamboreeSchedule } from "../generateBunkJamboreeSchedule";
import { generateNonBunkJamboreeSchedule } from "../generateNonBunkJamboreeSchedule";
import { getUseAttendeeListOptions } from "@/hooks/attendees/useAttendeeList";
import { getUseActivityPreferencesOptions } from "@/hooks/activityPreferences/useActivityPreferences";
import { getUseSectionScheduleOptions } from "@/hooks/schedules/useSectionSchedule";
import { getUseDaysOffScheduleOptions } from "@/hooks/daysOffSchedules/useDaysOffSchedule";
import { Section } from "@/types/sessions/sessionTypes";
import { getUseSectionListOptions } from "@/hooks/sections/useSectionList";
import { getUseBunkListOptions } from "@/hooks/bunks/useBunkList";

interface GenerateSectionScheduleRequest {
  sessionId: string;
  sectionId: string;
}

async function generateSectionSchedule(req: GenerateSectionScheduleRequest, client: QueryClient): Promise<SectionSchedule> {
  const { sessionId, sectionId } = req;
  const section = await client.ensureQueryData(sectionQueryOptions(sessionId, sectionId));

  if (!isSchedulingSection(section)) {
    throw new Error("Cannot generate a schedule for a non-scheduling section.");
  }

  switch (section.type) {
    case "BUNDLE":
      const firstBundleOfSession = (await client.ensureInfiniteQueryData(getUseSectionListOptions(sessionId, {
        where: [{ fieldPath: "type", operation: "==", value: "BUNDLE" }],
        orderBy: [{ fieldPath: "startDate", direction: "asc" }],
        limit: 1
      }))).pages[0].docs[0] as Section;
      const isFirstBundleOfSession = firstBundleOfSession.id === sectionId;
      return generateBundleSchedule({
        attendees: (await client.ensureInfiniteQueryData(getUseAttendeeListOptions(sessionId))).pages.flatMap(page => page.docs),
        camperActivityPreferences: await client.ensureQueryData(getUseActivityPreferencesOptions(req)),
        currentSchedule: await client.ensureQueryData(getUseSectionScheduleOptions(sessionId, sectionId)) as BundleSectionSchedule,
        daysOffSchedule: await client.ensureQueryData(getUseDaysOffScheduleOptions(sessionId)),
        section,
        isFirstBundleOfSession
      });
    case "BUNK-JAMBO":
      return generateBunkJamboreeSchedule({
        attendees: (await client.ensureInfiniteQueryData(getUseAttendeeListOptions(sessionId))).pages.flatMap(page => page.docs),
        bunkActivityPreferences: await client.ensureQueryData(getUseActivityPreferencesOptions(req)),
        bunks: (await client.ensureInfiniteQueryData(getUseBunkListOptions(sessionId))).pages.flatMap(page => page.docs),
        currentSchedule: await client.ensureQueryData(getUseSectionScheduleOptions(sessionId, sectionId)) as BunkJamboreeSectionSchedule
      });
    case "NON-BUNK-JAMBO":
      return generateNonBunkJamboreeSchedule({
        attendees: (await client.ensureInfiniteQueryData(getUseAttendeeListOptions(sessionId))).pages.flatMap(page => page.docs),
        currentSchedule: await client.ensureQueryData(getUseSectionScheduleOptions(sessionId, sectionId)) as NonBunkJamboreeSectionSchedule,
        sectionActivityPreferences: await client.ensureQueryData(getUseActivityPreferencesOptions(req)),
      });
  }
}

export default function useGenerateSectionSchedule() {
  return useMutation({
    mutationFn: async (req: GenerateSectionScheduleRequest, { client }) => generateSectionSchedule(req, client)
  })
}