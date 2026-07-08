"use client";

import { useState } from "react";
import { Button, Title, Text, Stack, Group, Divider } from "@mantine/core";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import moment from "moment";
import { Timestamp } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { CounselorAttendee, Session } from "@/types/sessions/sessionTypes";
import useListAttendees from "@/hooks/attendees/useListAttendees";
import useDaysOffSchedule from "@/hooks/daysOffSchedules/useDaysOffSchedule";
import useBunkList from "@/hooks/bunks/useBunkList";
import usePosts from "@/hooks/posts/usePosts";
import useFreeplayList from "@/hooks/freeplays/useFreeplayList";
import generateDaysOffSchedule from "@/features/scheduling/generation/generateDaysOffSchedule";
import generateNightSchedules from "@/features/scheduling/generation/generateNightSchedules";
import generateFreeplaySchedule from "@/features/scheduling/generation/generateFreeplaySchedule";
import { createDaysOffScheduleDoc } from "@/data/firestore/daysOffSchedules";
import { createNightScheduleDoc } from "@/data/firestore/nightSchedules";
import { createFreeplay } from "@/data/firestore/freeplays";
import { DaysOffScheduleDoc } from "@/data/firestore/types/documents";
import NightScheduleTable from "@/components/NightScheduleTable";
import useNotifications from "@/features/notifications/useNotifications";

// Session-scoped generation triggers (plan 017). Days-off is the prerequisite
// for night generation (and bundle generation, plan 018), so it comes first.
// See plans/017-session-scheduling-panel.md.
export default function SessionSchedulingPanel({ session }: { session: Session }) {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const attendeesQuery = useListAttendees(session.id);
  const daysOffQuery = useDaysOffSchedule(session.id);
  const bunksQuery = useBunkList(session.id);
  const postsQuery = usePosts();
  const freeplaysQuery = useFreeplayList(session.id);

  const [selectedDaysOff, setSelectedDaysOff] = useState<string[]>([]);
  const [generatingDaysOff, setGeneratingDaysOff] = useState(false);
  const [generatingNights, setGeneratingNights] = useState(false);
  const [freeplayDate, setFreeplayDate] = useState<string | null>(null);
  const [generatingFreeplay, setGeneratingFreeplay] = useState(false);

  const attendees = attendeesQuery.data ?? [];
  const counselors = attendees.filter(
    (a): a is CounselorAttendee => a.role === "STAFF" || a.role === "ADMIN",
  );
  const adminIds = attendees
    .filter((a) => a.role === "ADMIN")
    .map((a) => a.attendeeId);
  const bunks = bunksQuery.data?.pages.flatMap((page) => page.docs) ?? [];
  const hasDaysOff = daysOffQuery.isSuccess;

  const handleGenerateDaysOff = async () => {
    if (counselors.length === 0 || selectedDaysOff.length === 0) {
      notifications.error(
        "Select at least one day off, and make sure the session has staff/admin attendees.",
      );
      return;
    }
    setGeneratingDaysOff(true);
    try {
      const daysOffInSession = selectedDaysOff.map((d) => moment(d));
      const generated = generateDaysOffSchedule({
        session,
        counselors,
        daysOffInSession,
      });
      const scheduleDoc: DaysOffScheduleDoc = {
        daysOffInSession: generated.daysOffInSession.map((d) =>
          Timestamp.fromDate(d.toDate()),
        ),
        daysOffByCounselorId: Object.fromEntries(
          Object.entries(generated.daysOffByCounselorId).map(([id, days]) => [
            Number(id),
            days.map((d) => Timestamp.fromDate(d.toDate())),
          ]),
        ),
      };
      await createDaysOffScheduleDoc(session.id, scheduleDoc);
      queryClient.invalidateQueries({
        queryKey: ["sessions", session.id, "daysOffSchedule"],
      });
      notifications.success("Days-off schedule generated.");
    } catch {
      notifications.error(
        "Days-off generation failed — every full week in the session needs at least one selected day off.",
      );
    } finally {
      setGeneratingDaysOff(false);
    }
  };

  const handleGenerateNights = async () => {
    const daysOffSchedule = daysOffQuery.data;
    if (!daysOffSchedule || bunks.length === 0) {
      notifications.error(
        "Generate a days-off schedule and make sure the session has bunks before generating night schedules.",
      );
      return;
    }
    setGeneratingNights(true);
    try {
      const nightSchedules = generateNightSchedules({
        session,
        daysOffSchedule,
        bunks,
        adminIds,
      });
      await Promise.all(
        nightSchedules.map((ns) =>
          createNightScheduleDoc(session.id, ns.date, { bunks: ns.bunks }),
        ),
      );
      queryClient.invalidateQueries({
        queryKey: ["sessions", session.id, "nightSchedules"],
      });
      notifications.success("Night schedules generated.");
    } catch {
      notifications.error(
        "Night schedule generation failed. Please try again.",
      );
    } finally {
      setGeneratingNights(false);
    }
  };

  const handleGenerateFreeplay = async () => {
    if (!freeplayDate || attendees.length === 0) {
      notifications.error(
        "Pick a date and make sure the session has attendees.",
      );
      return;
    }
    setGeneratingFreeplay(true);
    try {
      const date = moment(freeplayDate);
      // Exclude the target date so regenerating it doesn't double-count against itself.
      const otherFreeplaysInSession = (freeplaysQuery.data?.docs ?? []).filter(
        (freeplay) => !freeplay.date.isSame(date, "day"),
      );
      const generated = generateFreeplaySchedule({
        sessionId: session.id,
        date,
        attendees,
        posts: postsQuery.data ?? [],
        otherFreeplaysInSession,
      });
      await createFreeplay(session.id, date, {
        posts: generated.posts,
        buddies: generated.buddies,
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions", session.id, "freeplays"],
      });
      notifications.success("Freeplay schedule generated.");
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Freeplay generation failed. Please try again.",
      );
    } finally {
      setGeneratingFreeplay(false);
    }
  };

  return (
    <div className="flex flex-col border border-black p-4 bg-neutral-2 gap-md">
      <Title order={2}>Scheduling</Title>

      <Stack className="gap-xs">
        <Text className="font-semibold">Days Off</Text>
        <Text className="text-sm text-neutral-6">
          Select the session days that are days off, then generate. Each full
          week in the session must have at least one day off.
        </Text>
        <Group className="items-start gap-lg">
          <DatePicker
            type="multiple"
            value={selectedDaysOff}
            onChange={setSelectedDaysOff}
            minDate={session.startDate.format("YYYY-MM-DD")}
            maxDate={session.endDate.format("YYYY-MM-DD")}
          />
          <Button
            color="green"
            loading={generatingDaysOff}
            disabled={generatingDaysOff || counselors.length === 0}
            onClick={handleGenerateDaysOff}
          >
            Generate days off
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack className="gap-xs">
        <Text className="font-semibold">Night Schedules</Text>
        <Text className="text-sm text-neutral-6">
          Requires a days-off schedule and bunks. Regenerating replaces the
          existing night schedules.
        </Text>
        <Group>
          <Button
            color="green"
            loading={generatingNights}
            disabled={generatingNights || !hasDaysOff || bunks.length === 0}
            onClick={handleGenerateNights}
          >
            Generate night schedules
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack className="gap-xs">
        <Text className="font-semibold">Freeplay</Text>
        <Text className="text-sm text-neutral-6">
          Generate a freeplay schedule for a single day. Requires attendees;
          post assignments use the session&apos;s posts.
        </Text>
        <Group className="items-end gap-lg">
          <DatePickerInput
            label="Freeplay date"
            placeholder="Select a day"
            value={freeplayDate}
            onChange={setFreeplayDate}
            minDate={session.startDate.format("YYYY-MM-DD")}
            maxDate={session.endDate.format("YYYY-MM-DD")}
            valueFormat="MMM DD, YYYY"
          />
          <Button
            color="green"
            loading={generatingFreeplay}
            disabled={
              generatingFreeplay || !freeplayDate || attendees.length === 0
            }
            onClick={handleGenerateFreeplay}
          >
            Generate freeplay
          </Button>
        </Group>
      </Stack>

      {hasDaysOff && (
        <>
          <Divider />
          <NightScheduleTable sessionId={session.id} />
        </>
      )}
    </div>
  );
}
