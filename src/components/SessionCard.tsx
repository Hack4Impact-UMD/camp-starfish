"use client";

import { Card, Stack, Title, Text, Button, ActionIcon } from "@mantine/core";
import { Moment } from "moment";
import { Session } from "@/types/sessions/sessionTypes";
import { useRouter } from "next/navigation";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import ConfirmationModal from "./ConfirmationModal";
import { MdDelete } from "react-icons/md";

interface SessionCardProps {
  session: Session;
  editMode: boolean;
}

export default function SessionCard({ session, editMode }: SessionCardProps) {
  const router = useRouter();

  const deleteSession = useDeleteSession();

  const formatDate = (date: Moment) => date.format("MMMM Do, YYYY");

  return (
    <Card
      key={session.id}
      shadow="md"
      radius="lg"
      classNames={{
        root: "bg-neutral-1 h-full w-full",
      }}
      onDoubleClick={() => router.push(`/sessions/${session.id}`)}
    >
      {/* Trash Icon wrapper */}
      {editMode && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <ConfirmationModal
            text={`Are you sure you want to delete the session "${session.name}"`}
            cannotUndo
            onConfirm={() => deleteSession.mutate({ sessionId: session.id })}
          >
            <ActionIcon
              variant="transparent"
              radius="xl"
              onClick={() => deleteSession.mutate({ sessionId: session.id })}
              className="hover:scale-110 transition-transform"
            >
              <MdDelete />
            </ActionIcon>
          </ConfirmationModal>
        </div>
      )}

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
      </Stack>
    </Card>
  );
}
