"use client";

import React from "react";
import { Container, Flex, Title, Text, Button, Switch, ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { Section, SchedulingSection, CommonSection } from "@/types/sessions/sessionTypes";
import ActivityCalendar from "./ActivityCalendar";
import Directory from "./Directory";

interface ActivityPageProps {
  sessionId: string;
}

// Placeholder data matching Figma design
const placeholderSession = {
  id: "session-a",
  name: "Session A",
  startDate: "2025-08-10",
  endDate: "2025-08-23",
};

const placeholderSections: Section[] = [
  { id: "1", name: "Opening Day", type: "COMMON", sessionId: "session-a", startDate: "2025-08-10", endDate: "2025-08-10" } as CommonSection,
  { id: "2", name: "Bundle 1", type: "BUNDLE", sessionId: "session-a", startDate: "2025-08-12", endDate: "2025-08-13", publishedAt: "2025-10-09T20:06:02Z", isScheduleOutdated: false } as SchedulingSection,
  { id: "3", name: "Jamboree 1", type: "BUNK-JAMBO", sessionId: "session-a", startDate: "2025-08-17", endDate: "2025-08-17", isScheduleOutdated: false } as SchedulingSection,
  { id: "4", name: "Bundle 3", type: "BUNDLE", sessionId: "session-a", startDate: "2025-08-19", endDate: "2025-08-21", isScheduleOutdated: false } as SchedulingSection,
  { id: "5", name: "Jamboree 2", type: "NON-BUNK-JAMBO", sessionId: "session-a", startDate: "2025-08-18", endDate: "2025-08-18", publishedAt: "2025-10-09T20:06:02Z", isScheduleOutdated: false } as SchedulingSection,
  { id: "6", name: "Tag Up", type: "COMMON", sessionId: "session-a", startDate: "2025-08-22", endDate: "2025-08-22" } as CommonSection,
  { id: "7", name: "Visitor's Day", type: "COMMON", sessionId: "session-a", startDate: "2025-08-23", endDate: "2025-08-23" } as CommonSection,
];

const placeholderPeople = [
  { name: "James A.", role: "STAFF" as const },
  { name: "Rocky J.", role: "STAFF" as const },
  { name: "Shriya Prasad", role: "STAFF" as const },
  { name: "Nicky K.", role: "STAFF" as const },
  { name: "Alex M.", role: "STAFF" as const },
  { name: "Jordan L.", role: "STAFF" as const },
  { name: "Sam C.", role: "CAMPER" as const },
  { name: "Taylor R.", role: "CAMPER" as const },
  { name: "Morgan B.", role: "ADMIN" as const },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ActivityPage({ sessionId }: ActivityPageProps) {
  return (
    <Container size="xl" className="py-8">
      {/* Header */}
      <Flex justify="space-between" align="center" className="mb-2">
        <Flex align="baseline" gap="md">
          <Title order={1} className="font-bold">
            {placeholderSession.name}
          </Title>
          <Text className="text-lg text-gray-600">August 2025</Text>
        </Flex>
        <Flex align="center" gap="sm">
          <Button color="teal" size="md">
            GENERATE
          </Button>
          <ActionIcon variant="filled" color="teal" size="lg" radius="xl">
            <IconEye size={20} />
          </ActionIcon>
        </Flex>
      </Flex>

      <Text className="text-sm text-gray-500 italic mb-6">
        Last generated: 10/09/25 8:06:02 PM EST
      </Text>

      {/* Night Schedule Toggle */}
      <Flex align="center" gap="sm" className="mb-6">
        <Switch size="md" />
        <Text className="font-semibold">Night Schedule</Text>
      </Flex>

      {/* Main content: Calendar + Directory */}
      <Flex gap="lg" align="flex-start">
        <div className="flex-grow">
          <ActivityCalendar
            startDate={placeholderSession.startDate}
            endDate={placeholderSession.endDate}
            sections={placeholderSections}
          />
        </div>
        <Directory people={placeholderPeople} />
      </Flex>
    </Container>
  );
}
