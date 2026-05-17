"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Stack,
  Title,
  Menu,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import moment from "moment";
import SessionCard from "@/components/SessionCard";
import { openCreateSessionModal } from "@/components/CreateSessionModal";
import useSessionList from "@/hooks/sessions/useSessionList";
import { MdAdd, MdCheck, MdEdit } from "react-icons/md";
import CardGallery from "./CardGallery";
import LoadingAnimation from "./LoadingAnimation";
import { useInViewport } from "@mantine/hooks";

export default function SessionsPage() {
  const [editMode, setEditMode] = useState(false);

  const sessionsQuery = useSessionList({
    orderBy: [{ fieldPath: "startDate", direction: "desc" }],
    limit: 10,
  });
  const sessions = sessionsQuery.data?.pages.flatMap((page) => page.docs) ?? [];

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = sessionsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Stack className="gap-md p-md">
      <Group className="justify-between items-center">
        <Title order={1}>Sessions</Title>
        <Group gap="sm">
          <Tooltip label="Toggle Edit Mode">
            <ActionIcon onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? <MdCheck size={30} /> : <MdEdit size={30} />}
            </ActionIcon>
          </Tooltip>

          <Menu>
            <Menu.Target>
              <Button color="green" rightSection={<MdAdd size={30} />}>
                Create Session
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={openCreateSessionModal}>
                Standard Session
              </Menu.Item>
              <Menu.Item onClick={openCreateSessionModal}>
                Customized Session
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      {sessions.length > 0 && (
        <>
          <CardGallery
            items={sessions}
            renderItem={(session) => (
              <SessionCard
                key={session.id}
                sessionId={session.id}
                editMode={editMode}
              />
            )}
            groups={{
              defaultGroupLabel: "Unknown",
              groupFunc: (session) => {
                const start = session.startDate;
                const end = session.endDate;
                if (moment().isBefore(start)) {
                  return "Future";
                } else if (moment().isSameOrBefore(end)) {
                  return "Current";
                } else {
                  return "Past";
                }
              },
              groupLabels: ["Future", "Current", "Past"],
            }}
          />
          {sessionsQuery.isFetchingNextPage && (
            <div className="w-1/3 self-center">
              <LoadingAnimation />
            </div>
          )}
          {!sessionsQuery.hasNextPage && (
            <Title order={4} classNames={{ root: "self-center" }}>
              All Done!
            </Title>
          )}
          <div className="invisible" ref={ref} />
        </>
      )}
    </Stack>
  );
}
