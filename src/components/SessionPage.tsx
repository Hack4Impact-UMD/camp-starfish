"use client";

import { useMemo } from "react";
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import { Session } from "@/types/sessionTypes";

interface SessionsPageProps {
  sessions: Session[];
  onCreateSession?: () => void;
  onEditSession?: (session: Session) => void;
}

export default function SessionsPage({
  sessions,
  onCreateSession,
  onEditSession,
}: SessionsPageProps) {
  const theme = useMantineTheme();
  const now = new Date();

  const { current, future, past } = useMemo(() => {
    const current: Session[] = [];
    const future: Session[] = [];
    const past: Session[] = [];

    for (const s of sessions) {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);

      if (start <= now && now < end) current.push(s);
      else if (start > now) future.push(s);
      else past.push(s);
    }

    future.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
    past.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));

    return { current, future, past };
  }, [sessions, now]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const renderSessionCard = (session: Session) => (
    <Card
      key={session.name}
      shadow="md"
      radius="lg"
      withBorder
      style={{
        backgroundColor: theme.colors.neutral[0],
        borderColor: theme.colors.neutral[3],
        transition: "background-color 150ms ease",
      }}
    >
      <Stack align="center" gap="sm" p="sm">
        <Title order={4} c={theme.colors.primary[6]}>
          {session.name}
        </Title>

        <Stack gap={0} align="center">
          <Text size="sm">
            <strong>From:</strong> {formatDate(session.startDate)}
          </Text>
          <Text size="sm">
            <strong>To:</strong> {formatDate(session.endDate)}
          </Text>
        </Stack>

        <Button
          mt="sm"
          color="secondary-green"
          radius="xl"
          onClick={() => onEditSession?.(session)}
          style={{
            backgroundColor: theme.colors["secondary-green"][4],
            color: "white",
          }}
        >
          GO TO SCHEDULE
        </Button>
      </Stack>
    </Card>
  );

  return (
    <Stack gap={36} p="md">
      {/* Current Sessions */}
      <Stack gap={12}>
        <Title order={3}>Current Session</Title>
        {current.length ? (
          current.map(renderSessionCard)
        ) : (
          <Text color="dimmed">No current session</Text>
        )}
      </Stack>

      <Divider />

      {/* Future + Past Sessions */}
      <Stack gap={12}>
        <Title order={3}>Non-Current Session</Title>

        <Stack gap={4}>
          <Title order={4}>Future Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {future.length ? (
              future.map(renderSessionCard)
            ) : (
              <Text color="dimmed">No future sessions</Text>
            )}
          </Group>
        </Stack>

        <Stack gap={4} mt="md">
          <Title order={4}>Past Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {past.length ? (
              past.map(renderSessionCard)
            ) : (
              <Text color="dimmed">No past sessions</Text>
            )}
          </Group>
        </Stack>
      </Stack>
    </Stack>
  );
}
