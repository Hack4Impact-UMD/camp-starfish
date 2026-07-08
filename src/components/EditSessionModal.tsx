import React, { useState } from "react";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import { Button, TextInput, Stack, Group, Box } from "@mantine/core";
import moment from "moment";
import useUpdateSession from "@/hooks/sessions/useUpdateSession";
import useNotifications from "@/features/notifications/useNotifications";
import { Session } from "@/types/sessions/sessionTypes";
import { modals } from "@mantine/modals";

interface EditSessionModalProps {
  session: Session;
}

export default function EditSessionModal({ session }: EditSessionModalProps) {
  const [sessionName, setSessionName] = useState<string>(session.name);
  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    moment(session.startDate).toDate(),
    moment(session.endDate).toDate(),
  ]);
  const updateSessionMutation = useUpdateSession();
  const notifications = useNotifications();

  const handleSave = () => {
    const [startDate, endDate] = dateRange;

    if (sessionName.trim() === "" || !startDate || !endDate) {
      return;
    }

    updateSessionMutation.mutate(
      {
        sessionId: session.id,
        name: session.name !== sessionName ? sessionName : undefined,
        startDate: moment(startDate).isSame(session.startDate, "day")
          ? undefined
          : moment(startDate),
        endDate: moment(endDate).isSame(session.endDate, "day")
          ? undefined
          : moment(endDate),
      },
      {
        onSuccess: () => {
          modals.closeAll();
          notifications.success("Session updated.");
        },
        onError: () =>
          notifications.error("Failed to update session. Please try again."),
      },
    );
  };

  return (
    <Box className="bg-white max-w-full mx-auto overflow-hidden gap-xl">
      <Stack className="gap-xl">
        <TextInput
          label="Session Name"
          placeholder="Enter name..."
          value={sessionName}
          onChange={(e) => setSessionName(e.currentTarget.value)}
          className="w-full"
        />
        <DatePickerInput
          label="Dates"
          placeholder="Select session dates"
          type="range"
          value={dateRange}
          onChange={setDateRange}
          valueFormat="MMM DD, YYYY"
        />
        <Group className="justify-center gap-md">
          <Button color="neutral" onClick={() => modals.closeAll()}>
            CANCEL
          </Button>

          <Button
            color="green"
            onClick={handleSave}
            loading={updateSessionMutation.isPending}
          >
            SAVE
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export function openEditSessionModal(session: Session) {
  modals.open({
    title: "Edit Session",
    children: <EditSessionModal session={session} />,
  });
}
