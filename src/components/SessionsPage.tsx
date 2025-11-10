"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Stack,
  Title,
  Divider,
  Menu,
  Text,
} from "@mantine/core";
import moment from "moment";
import Image from "next/image";
import { SessionID } from "@/types/sessionTypes";
import pencilIcon from "@/assets/icons/pencilIcon.svg";
import SessionCard from "@/components/SessionCard";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";

interface SessionsPageProps {
  sessions: SessionID[];
}

export default function SessionsPage({ sessions }: SessionsPageProps) {
  const [editMode, setEditMode] = useState(false);
  const deleteSessionMutation = useDeleteSession();
  const now = moment();

  // --- Categorize sessions ---
  const { current, future, past } = useMemo(() => {
    const current: SessionID[] = [];
    const future: SessionID[] = [];
    const past: SessionID[] = [];

    for (const s of sessions) {
      const start = moment(s.startDate);
      const end = moment(s.endDate);

      if (now.isSameOrAfter(start) && now.isBefore(end)) current.push(s);
      else if (start.isAfter(now)) future.push(s);
      else past.push(s);
    }

    future.sort((a, b) => moment(a.startDate).diff(moment(b.startDate)));
    past.sort((a, b) => moment(b.startDate).diff(moment(a.startDate)));

    return { current, future, past };
  }, [sessions, now]);

  // --- Handlers ---
  const handleCreateSession = (type: "standard" | "customized") => {
    console.log("Creating session:", type);
    // Add your session creation logic here
    // For example: navigate to create session page or open modal
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSessionMutation.mutate(id);
    }
  };

  return (
    <Stack gap={36} p="md">
      {/* Top bar */}
      <Group justify="space-between" align="center">
        <Title order={2}>Sessions</Title>

        <Group gap="sm">
          {/* Edit / Done button */}
          <Button
            size="lg"
            color="primary"
            radius="xl"
            leftSection={
              <Image
                src={pencilIcon}
                alt="Edit"
                width={18}
                height={18}
                style={{
                  filter:
                    "invert(100%) sepia(100%) saturate(0%) hue-rotate(180deg)",
                }}
              />
            }
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Done" : "Edit"}
          </Button>

          {/* Create Session Dropdown */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button size="lg" color="secondary-green" radius="xl">
                Create Session
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <Image src={pencilIcon} alt="Standard" width={16} height={16} />
                }
                onClick={() => handleCreateSession("standard")}
              >
                Standard Session
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <Image src={pencilIcon} alt="Customized" width={16} height={16} />
                }
                onClick={() => handleCreateSession("customized")}
              >
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
                onDelete={handleDelete}
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

        {/* Future */}
        <Stack gap={4}>
          <Title order={4}>Future Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {future.length ? (
              future.map((session) => (
                <SessionCard
                  key={session.name}
                  session={session}
                  editMode={editMode}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Text c="dimmed">No future sessions</Text>
            )}
          </Group>
        </Stack>

        {/* Past */}
        <Stack gap={4} mt="md">
          <Title order={4}>Past Sessions</Title>
          <Group justify="flex-start" wrap="wrap" gap="md">
            {past.length ? (
              past.map((session) => (
                <SessionCard
                  key={session.name}
                  session={session}
                  editMode={editMode}
                  onDelete={handleDelete}
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