"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Divider,
  Menu,
  ActionIcon,
  useMantineTheme,
} from "@mantine/core";
import moment from "moment";
import Image from "next/image";
import { Session } from "@/types/sessionTypes";

import pencilIcon from "@/assets/icons/pencilIcon.svg";
import trashIcon from "@/assets/icons/trashIcon.svg";

interface SessionsPageProps {
  sessions: Session[];
  onCreateSession?: (type: "standard" | "customized") => void;
  onDeleteSession?: (id: string) => void;
}

export default function SessionsPage({
  sessions,
  onCreateSession,
  onDeleteSession,
}: SessionsPageProps) {
  const theme = useMantineTheme();
  const now = moment();

  const [editMode, setEditMode] = useState(false);

  // --- Categorize sessions ---
  const { current, future, past } = useMemo(() => {
    const current: Session[] = [];
    const future: Session[] = [];
    const past: Session[] = [];

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
    console.log("Create session type:", type);
    onCreateSession?.(type);
  };

  const handleDelete = (id: string) => {
    console.log("Deleting session:", id);
    onDeleteSession?.(id);
  };

  const formatDate = (date: string) => moment(date).format("dddd, MMMM Do");

  // --- Render Helper ---
  const renderSessionCard = (session: Session) => (
    <Card
      key={session.name}
      shadow="md"
      radius="lg"
      withBorder
      style={{
        position: "relative",
        width: "260px",
        borderColor: theme.colors.gray[3],
        backgroundColor: theme.colors.gray[0],
      }}
    >
      <Stack align="center" gap="sm" p="sm">
        <Title order={4} c="primary">
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
          onClick={() => console.log("Go to schedule:", session.name)}
        >
          GO TO SCHEDULE
        </Button>
      </Stack>

      {/* Trash Icon (only in edit mode) */}
      {editMode && (
        <ActionIcon
          variant="transparent"
          radius="xl"
          onClick={() => handleDelete(session.name)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <Image src={trashIcon} alt="Delete" width={20} height={20} />
        </ActionIcon>
      )}
    </Card>
  );

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
                  filter: "invert(100%) sepia(100%) saturate(0%) hue-rotate(180deg)"
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
                leftSection={<Image src={pencilIcon} alt="Standard" width={16} height={16} />}
                onClick={() => handleCreateSession("standard")}
              >
                Standard Session
              </Menu.Item>
              <Menu.Item
                leftSection={<Image src={pencilIcon} alt="Customized" width={16} height={16} />}
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
            current.map(renderSessionCard)
          ) : (
            <Text color="dimmed">No current session</Text>
          )}
        </Group>
      </Stack>

      <Divider />

      {/* Non-Current Sessions */}
      <Stack gap={12}>
        <Title order={3}>Non-Current Session</Title>

        {/* Future */}
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

        {/* Past */}
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
