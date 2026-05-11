"use client";

import { Card, Stack, Title, Text, ActionIcon } from "@mantine/core";
import { Moment } from "moment";
import { useRouter } from "next/navigation";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import ConfirmationModal from "./ConfirmationModal";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import classNames from "classnames";
import useSession from "@/hooks/sessions/useSession";
import LoadingAnimation from "./LoadingAnimation";
import ErrorPage from "@/app/error";

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

  const formatDate = (date: Moment) => date.format("dddd, MMMM D, YYYY");

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
            <div className="absolute top-2.5 right-2.5 z-10">
              <ConfirmationModal
                text={`Are you sure you want to delete the session "${session.name}"`}
                cannotUndo
                onConfirm={() => deleteSession.mutate({ sessionId })}
              >
                <ActionIcon
                  variant="transparent"
                  radius="xl"
                  onClick={() => deleteSession.mutate({ sessionId })}
                  className="hover:scale-110 transition-transform"
                >
                  <MdDelete size={30} />
                </ActionIcon>
              </ConfirmationModal>
            </div>
          )}
          <Stack className="gap-sm p-sm items-center">
            <Title order={4}>{session.name}</Title>

            <Stack className="gap-0 items-center">
              <Text size="sm">
                <strong>Starts:</strong> {formatDate(session.startDate)}
              </Text>
              <Text size="sm">
                <strong>Ends:</strong> {formatDate(session.endDate)}
              </Text>
            </Stack>
          </Stack>
        </>
      );
  }

  return (
    <Card
      key={sessionId}
      classNames={{ root: classNames({ "bg-neutral-2": isSelected }) }}
      onClick={() => setIsSelected((prev) => !prev)}
      onDoubleClick={() => router.push(`/sessions/${sessionId}`)}
    >
      {content}
    </Card>
  );
}
