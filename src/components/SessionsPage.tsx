"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Title,
  Menu,
  ActionIcon,
  Text,
  Tooltip,
} from "@mantine/core";
import moment from "moment";
import SessionCard from "@/components/SessionCard";
import { openCreateSessionModal } from "@/components/CreateSessionModal";
import openConfirmationModal from "@/components/modals/ConfirmationModal";
import useSessionList from "@/hooks/sessions/useSessionList";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import { MdAdd, MdCheck, MdClose, MdDelete, MdEdit } from "react-icons/md";
import CardGallery from "./CardGallery";
import LoadingAnimation from "./LoadingAnimation";
import { useInViewport } from "@mantine/hooks";

export default function SessionsPage() {
  const [editMode, setEditMode] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  const sessionsQuery = useSessionList({
    orderBy: [{ fieldPath: "startDate", direction: "desc" }],
    limit: 10,
  });
  const sessions = sessionsQuery.data?.pages.flatMap((page) => page.docs) ?? [];

  const deleteSession = useDeleteSession();

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = sessionsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clearSelection = () => setSelectedSessionIds([]);
  const toggleDeleteMode = () => {
    setEditMode((prev) => !prev);
    clearSelection();
  };
  const selectAll = () => setSelectedSessionIds(sessions.map((s) => s.id));
  const deleteSelected = () =>
    openConfirmationModal({
      title: `Delete ${selectedSessionIds.length} session${selectedSessionIds.length === 1 ? "" : "s"}?`,
      message:
        "WARNING: This action cannot be undone. All schedule and attendee info related to these sessions will be deleted.",
      onConfirm: () => {
        selectedSessionIds.forEach((sessionId) =>
          deleteSession.mutate({ sessionId }),
        );
        clearSelection();
      },
    });

  const selectionToolbar = (
    <Group gap="xs" wrap="nowrap" className="rounded-full bg-navy-9 py-2 pl-5 pr-2">
      <Text className="font-medium text-white whitespace-nowrap">
        {selectedSessionIds.length} selected
      </Text>
      <Button variant="white" color="navy.9" radius="xl" size="sm" onClick={selectAll}>
        Select All
      </Button>
      <Tooltip label="Delete selected">
        <ActionIcon
          variant="outline"
          color="white"
          radius="xl"
          size={36}
          onClick={deleteSelected}
          aria-label="Delete selected sessions"
        >
          <MdDelete size={18} />
        </ActionIcon>
      </Tooltip>
      <ActionIcon
        variant="transparent"
        color="white"
        size={36}
        onClick={clearSelection}
        aria-label="Clear selection"
      >
        <MdClose size={20} />
      </ActionIcon>
    </Group>
  );

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <Group className="justify-between items-center">
        <Title order={1} className="text-[40px] font-bold text-navy-9">
          Sessions
        </Title>
        <Group gap="sm">
          <Tooltip label="Toggle Delete Mode">
            <ActionIcon onClick={toggleDeleteMode}>
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
            selectable={editMode}
            selectedItemIds={selectedSessionIds}
            onSelectionChange={setSelectedSessionIds}
            firstGroupActions={
              editMode && selectedSessionIds.length > 0
                ? selectionToolbar
                : undefined
            }
            renderItem={(session, isSelected) => (
              <SessionCard
                key={session.id}
                sessionId={session.id}
                editMode={editMode}
                isSelected={isSelected}
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
    </div>
  );
}
