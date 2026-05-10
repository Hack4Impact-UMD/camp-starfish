"use client";

import { useMemo, useState } from "react";
import { Button, Group, Stack, Title, Menu, Text, ActionIcon, Tooltip } from "@mantine/core";
import moment from "moment";
import { Session } from "@/types/sessions/sessionTypes";
import SessionCard from "@/components/SessionCard";
import { openCreateSessionModal } from "@/components/CreateSessionModal";
import useSessionList from "@/hooks/sessions/useSessionList";
import { MdCheck, MdEdit } from "react-icons/md";

export default function SessionsPage() {
  const [editMode, setEditMode] = useState(false);

  const sessionsQuery = useSessionList({
    orderBy: [{ fieldPath: "startDate", direction: "desc" }],
    startAt: [moment().add(6, 'month').startOf('day').toDate()],
    endAt: [moment().subtract(6, 'month').startOf('day').toDate()],
    limit: 10
  });
  const sessions = sessionsQuery.data?.pages.flatMap(page => page.docs) ?? [];

  // --- Categorize sessions ---
  const { future, current, past } = useMemo(() => {
    const now = moment();
    const current: Session[] = [];
    const future: Session[] = [];
    const past: Session[] = [];

    sessions.forEach(session => {
      const start = session.startDate;
      const end = session.endDate;

      if (now.isBefore(start)) { future.push(session); }
      else if (now.isSameOrBefore(end)) { current.push(session); }
      else { past.push(session); }
    })
    return { future, current, past };
  }, [sessions]);

  return (
    <Stack gap={36} p="md">
      {/* Top bar */}
      <Group justify="space-between" align="center">
        <Title order={2}>Sessions</Title>
        <Group gap="sm">
          <Tooltip label="Toggle Edit Mode">
            <ActionIcon onClick={() => setEditMode(prev => !prev)}>
              {editMode ? <MdCheck size={30} /> : <MdEdit size={30} />}
            </ActionIcon>
          </Tooltip>

          {/* Create Session Dropdown */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button size="lg" color="green" radius="xl">
                Create Session
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={openCreateSessionModal} >
                Standard Session
              </Menu.Item>
              <Menu.Item onClick={openCreateSessionModal} >
                Customized Session
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Current Sessions */}
      <Stack gap={12}>
        <Title order={3}>Current Session</Title>
        <Group justify="flex-start" wrap="wrap" gap="md">
          {current.length ? (
            current.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                editMode={editMode}
              />
            ))
          ) : (
            <Text c="dimmed">No current session</Text>
          )}
        </Group>
      </Stack>

      {/* Non-Current Sessions */}
      <Stack gap={12}>
        <Title order={3}>Non-Current Session</Title>

        <Stack gap={4}>
          <Title order={4}>Future Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {future.length ? (
              future.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  editMode={editMode}
                />
              ))
            ) : (
              <Text c="dimmed">No future sessions</Text>
            )}
          </Group>
        </Stack>

        <Stack gap={4} mt="md">
          <Title order={4}>Past Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {past.length ? (
              past.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  editMode={editMode}
                />
              ))
            ) : (
              <Text c="dimmed">No past sessions</Text>
            )}
          </Group>
        </Stack>
      </Stack>
    </Stack>
  );
}
