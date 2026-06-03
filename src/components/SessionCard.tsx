"use client";

import { Card, Stack, Title, Text, ActionIcon } from "@mantine/core";
import { Moment } from "moment";
import { useRouter } from "next/navigation";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import classNames from "classnames";
import useSession from "@/hooks/sessions/useSession";
import LoadingAnimation from "./LoadingAnimation";
import ErrorPage from "@/app/error";
import openConfirmationModal from "./modals/ConfirmationModal";

interface SessionCardProps {
  sessionId: string;
  editMode: boolean;
}

export default function SessionCard(props: SessionCardProps) {
  const { sessionId, editMode } = props;
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const sessionQuery = useSession(sessionId);

  const router = useRouter();

  const deleteSession = useDeleteSession();

  const formatDate = (date: Moment) => date.format("dddd, MMMM Do");

  let content = <></>;
  switch (sessionQuery.status) {
    case "error":
      content = <ErrorPage error={sessionQuery.error} />;
      break;
    case "pending":
      content = <LoadingAnimation />;
      break;
    case "success":
      const session = sessionQuery.data;
      content = (
        <>
          {editMode && (
            <ActionIcon
              variant="subtle"
              color="navy.9"
              onClick={(e) => {
                e.stopPropagation();
                openConfirmationModal({
                  title: `Are you sure you want to delete the session "${session.name}"?`,
                  message:
                    "WARNING: This action cannot be undone. All schedule and attendee info related to this session will be deleted.",
                  onConfirm: () => deleteSession.mutate({ sessionId }),
                });
              }}
              className="absolute top-2 right-2 z-10"
            >
              <MdDelete size={22} />
            </ActionIcon>
          )}

          <Stack className="gap-md">
            <Title order={3} className="text-center font-bold text-navy-9">
              {session.name}
            </Title>
            <Stack className="gap-0">
              <Text size="sm">
                <strong>From:</strong> {formatDate(session.startDate)}
              </Text>
              <Text size="sm">
                <strong>To:</strong> {formatDate(session.endDate)}
              </Text>
            </Stack>
          </Stack>
        </>
      );
  }

  return (
    <Card
      key={sessionId}
      withBorder
      shadow="sm"
      radius="md"
      classNames={{
        root: classNames("relative cursor-pointer", {
          "bg-neutral-2": isSelected,
        }),
      }}
      onClick={() => setIsSelected((prev) => !prev)}
      onDoubleClick={() => router.push(`/sessions/${sessionId}`)}
    >
      {content}
    </Card>
  );
}
