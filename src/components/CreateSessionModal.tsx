import React, { useState } from "react";
import { DatePicker, DatesRangeValue } from "@mantine/dates";
import { Button, TextInput, Stack, Group, Text, Modal } from "@mantine/core";
import moment from "moment";
import { Session } from "@/types/sessionTypes";
import useCreateSession from "@/hooks/sessions/useCreateSession";
import { modals } from "@mantine/modals";

export default function CreateSessionModal() {
  const [sessionName, setSessionName] = useState("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
  const createSessionMutation = useCreateSession();

  const [error, setError] = useState("");

  const handleGenerate = () => {
    const [startDateStr, endDateStr] = dateRange;

    if (sessionName.trim() === "") {
      setError("Please enter a session name.");
      return;
    }

    if (!startDateStr || !endDateStr) {
      setError("Please select a start and end date.");
      return;
    }

    const newSession: Session = {
      name: sessionName,
      startDate: moment(startDateStr).startOf("day").toISOString(),
      endDate: moment(endDateStr).endOf("day").toISOString(),
      driveFolderId: "",
    };

    createSessionMutation.mutate(newSession);
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-primary-5 px-10 py-6 text-white">
        <Text size="xl" fw={700} className="tracking-wide">
          CREATE SESSION
        </Text>
      </div>

      {/* Content */}
      <div className="p-10">
        <Stack gap="xl">
          {/* Session Name */}
          <div className="flex flex-row gap-[5px]">
            <Text size="lg" className="mb-3 text-black font-[700]">
              Enter Session Name:
            </Text>
            <TextInput
              placeholder="Enter name..."
              value={sessionName}
              onChange={(e) => setSessionName(e.currentTarget.value)}
              className="w-[50%]"
            />
          </div>

          {/* Date Picker */}
          <div>
            <div className="flex flex-row items-center gap-[5px]">
              <Text size="lg" fw={700} className=" text-black">
                Select Session Dates:
              </Text>

              <TextInput
                placeholder="Start Date"
                className="w-[25%]"
                value={
                  dateRange[0] ? moment(dateRange[0]).format("MMM D, YYYY") : ""
                }
                disabled
              />

              <Text>To</Text>

              <TextInput
                placeholder="End Date"
                className="w-[25%] placeholder:text-neutral-400"
                value={
                  dateRange[1] ? moment(dateRange[1]).format("MMM D, YYYY") : ""
                }
                disabled
              />
            </div>

            <div className="flex justify-center">
              <div className="max-w-[350px] mt-[20px] py-[16px] px-[10px] border !border-primary-5 !rounded-sm !p-2">
                <DatePicker
                  type="range"
                  value={dateRange}
                  onChange={setDateRange}
                  numberOfColumns={1}
                  size="md"
                  withCellSpacing={false}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <Group justify="center" gap="md" className="mt-5">
            <Button
              className=" w-[100px] bg-neutral-3 text-neutral-9"
              onClick={() => modals.closeAll()}
            >
              CANCEL
            </Button>

            <Button
              className=" w-[100px] bg-secondary-green-4 text-neutral-0"
              onClick={handleGenerate}
            >
              DONE
            </Button>
          </Group>
        </Stack>
      </div>
    </div>
  );
}

export function openCreateSessionModal() {
  modals.open({
    title: "Create Session",
    children: <CreateSessionModal />,
  });
};
