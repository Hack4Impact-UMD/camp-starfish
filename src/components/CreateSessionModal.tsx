import React, { useState } from "react";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import { Button, TextInput, Stack, Group, Text, Box } from "@mantine/core";
import moment from "moment";
import useCreateSession from "@/hooks/sessions/useCreateSession";
import { modals } from "@mantine/modals";

export default function CreateSessionModal() {
  const [sessionName, setSessionName] = useState<string>("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const createSessionMutation = useCreateSession();

  const handleGenerate = () => {
    const [startDateStr, endDateStr] = dateRange;

    if (sessionName.trim() === "" || !startDateStr || !endDateStr) {
      return;
    }

    createSessionMutation.mutate({
      name: sessionName,
      startDate: moment(startDateStr).startOf("day"),
      endDate: moment(endDateStr).endOf("day"),
    }, {
      onSuccess: () => modals.closeAll()
    });
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
