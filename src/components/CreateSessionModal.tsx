import React, { useState } from "react";
import { DatePicker, DatesRangeValue } from "@mantine/dates";
import {
  Button,
  TextInput,
  Stack,
  Group,
  Text,
  Box,
} from "@mantine/core";
import moment from "moment";
import { Session } from "@/types/sessionTypes";
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

    const newSession: Session = {
      name: sessionName,
      startDate: moment(startDateStr).startOf("day").toISOString(),
      endDate: moment(endDateStr).endOf("day").toISOString(),
      driveFolderId: "",
    };

    createSessionMutation.mutate(newSession);
    modals.closeAll();
  };

  return (
    <Box className="bg-neutral-100 max-w-full mx-auto overflow-hidden gap-xl">
      <Stack className="gap-xl">
        <TextInput
          label="Session Name"
          placeholder="Enter name..."
          value={sessionName}
          onChange={(e) => setSessionName(e.currentTarget.value)}
          className="w-full"
        />

        {/* Date Picker */}
        <Stack className="items-center gap-lg">
          <Group className="w-full items-center gap-[5px]">
            <TextInput
              label="Start Date"
              placeholder="Start Date"
              className="w-1/4"
              value={
                dateRange[0] ? moment(dateRange[0]).format("MMM D, YYYY") : ""
              }
              classNames={{
                root: "flex-grow",
              }}
            />

            <Text>To</Text>

            <TextInput
              label="End Date"
              placeholder="End Date"
              className="w-1/4 placeholder:text-neutral-400"
              value={
                dateRange[1] ? moment(dateRange[1]).format("MMM D, YYYY") : ""
              }
              classNames={{
                root: "flex-grow",
              }}
            />
          </Group>

          <DatePicker
            type="range"
            value={dateRange}
            onChange={setDateRange}
            numberOfColumns={1}
            size="md"
            withCellSpacing={false}
          />
        </Stack>

        <Group className="justify-center gap-md">
          <Button
            color="neutral"
            className=" "
            onClick={() => modals.closeAll()}
          >
            CANCEL
          </Button>

          <Button color="green" className="w-[100px]" onClick={handleGenerate}>
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
