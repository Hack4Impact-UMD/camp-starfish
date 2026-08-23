import React, { useState } from "react";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import { Button, TextInput, Stack, Group, Box } from "@mantine/core";
import moment from "moment";
import useCreateSession from "@/hooks/sessions/useCreateSession";
import { modals } from "@mantine/modals";
import { createSessionSchema } from "@/schemas/sessions";
import useNotifications from "@/features/notifications/useNotifications";

export default function CreateSessionModal() {
  const [sessionName, setSessionName] = useState<string>("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const createSessionMutation = useCreateSession();
  const notifications = useNotifications();

  const handleGenerate = () => {
    const result = createSessionSchema.safeParse({
      name: sessionName,
      dateRange,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setNameError(fieldErrors.name?.[0] ?? null);
      setDateError(fieldErrors.dateRange?.[0] ?? null);
      return;
    }

    const [startDateStr, endDateStr] = result.data.dateRange;
    createSessionMutation.mutate(
      {
        name: result.data.name,
        startDate: moment(startDateStr!).startOf("day"),
        endDate: moment(endDateStr!).endOf("day"),
      },
      {
        onSuccess: () => modals.closeAll(),
        onError: () =>
          notifications.error("Failed to create session. Please try again."),
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
          onChange={(e) => {
            setSessionName(e.currentTarget.value);
            setNameError(null);
          }}
          error={nameError}
          className="w-full"
        />
        <DatePickerInput
          label="Dates"
          placeholder="Select session dates"
          type="range"
          value={dateRange}
          onChange={(value) => {
            setDateRange(value);
            setDateError(null);
          }}
          error={dateError}
          valueFormat="MMM DD, YYYY"
        />
        <Group className="justify-center gap-md">
          <Button
            color="neutral"
            onClick={() => modals.closeAll()}
          >
            CANCEL
          </Button>

          <Button color="green" onClick={handleGenerate} loading={createSessionMutation.isPending}>
            DONE
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export function openCreateSessionModal() {
  modals.open({
    title: "Create Session",
    children: <CreateSessionModal />,
  });
}
