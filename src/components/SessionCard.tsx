"use client";

import { Card, Stack, Title, Text, Button, ActionIcon } from "@mantine/core";
import Image from "next/image";
import moment from "moment";
import trashIcon from "@/assets/icons/trashIcon.svg";
import { SessionID } from "@/types/sessionTypes";
import { useRouter } from "next/navigation";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import ConfirmationModal from "./ConfirmationModal";

interface SessionCardProps {
  session: SessionID;
  editMode: boolean;
}

export default function SessionCard({ session, editMode }: SessionCardProps) {
  const router = useRouter();

  const deleteSession = useDeleteSession();

  const formatDate = (date: string) => moment(date).format("dddd, MMMM Do");

  return (
    <Card
      key={session.id}
      shadow="md"
      radius="lg"
      classNames={{
        root: "relative w-[260px] bg-neutral-1",
      }}
    >
      {/* Trash Icon wrapper */}
      {editMode && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <ConfirmationModal text={`Are you sure you want to delete the session "${session.name}"`} cannotUndo onConfirm={() => deleteSession.mutate(session.id)}>
            <ActionIcon
              variant="transparent"
              radius="xl"
              onClick={() => deleteSession.mutate(session.id)}
              className="hover:scale-110 transition-transform"
            >
              <Image src={trashIcon} alt="Delete" width={20} height={20} />
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

        <Button
          mt="sm"
          color="secondary-green"
          radius="xl"
          onClick={() => router.push(`/sessions/${session.id}`)}
        >
          GO TO SCHEDULE
        </Button>
      </Stack>
    </Card>
  );
}
