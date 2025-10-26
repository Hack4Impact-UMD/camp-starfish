// CreateSession.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Paper,
} from "@mantine/core";
import { DatePicker, DatesRangeValue } from "@mantine/dates";

interface CreateSessionProps {
  onSubmit: (sessionName: string, dateRange: [Date | null, Date | null]) => void;
}

export const CreateSession: React.FC<CreateSessionProps> = ({ onSubmit }) => {
  const [sessionName, setSessionName] = useState("");
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

  const handleSubmit = () => {
    if (!sessionName.trim()) {
      alert("Please enter a session name.");
      return;
    }
    if (!dateRange[0] || !dateRange[1]) {
      alert("Please select a start and end date.");
      return;
    }

    const startDate = dateRange[0] instanceof Date ? dateRange[0] : new Date(dateRange[0]);
    const endDate = dateRange[1] instanceof Date ? dateRange[1] : new Date(dateRange[1]);

    console.log("Session Name:", sessionName);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Date Range Type:", typeof dateRange[0], typeof dateRange[1]);
  
    onSubmit(sessionName, [startDate, endDate]);
  };


  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#3A3A3A",
      }}
    >
      <Paper
        radius="md"
        shadow="lg"
        p="xl"
        style={{
          width: 600,
          backgroundColor: "#fff",
        }}
      >
        <Title
          order={3}
          style={{
            backgroundColor: "#003366",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: "6px 6px 0 0",
            margin: "-1rem -1rem 1rem -1rem",
          }}
        >
          CREATE SESSION
        </Title>

        <Stack gap="md">
          <Box>
            <Text fw={600} mb={4}>
              Enter Session Name:
            </Text>
            <TextInput
              placeholder="enter session name here"
              value={sessionName}
              onChange={(e) => setSessionName(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: "#f3f6f9",
                  borderRadius: "6px",
                },
              }}
            />
          </Box>

          <Box>
            <Text fw={600} mb={4}>
              Select Session Dates:
            </Text>
            <DatePicker
              type="range"
              value={dateRange}
              onChange={setDateRange}
              numberOfColumns={2}
              styles={{
                day: {
                  borderRadius: "50%",
                  "&[data-selected]": {
                    backgroundColor: "#003366",
                    color: "white",
                  },
                },
                calendarHeaderLevel: { fontWeight: 600 },
              }}
            />
          </Box>

          {dateRange[0] && dateRange[1] && (
            <Text size="sm" ta="right" c="dimmed">
              Selecting{" "}
              {dateRange[0].toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {dateRange[1].toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              color="gray"
              radius="xl"
              style={{ paddingInline: "1.5rem" }}
            >
              Cancel
            </Button>
            <Button
              color="teal"
              radius="xl"
              onClick={handleSubmit}
              style={{
                backgroundColor: "#00A86B",
                paddingInline: "1.5rem",
              }}
            >
              Generate
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};
