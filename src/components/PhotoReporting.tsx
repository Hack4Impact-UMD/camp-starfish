"use client";

import { useState } from "react";
import { Button, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { MdError, MdFlag } from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import useCreateAlbumItemReport from "@/features/albums/albumItemReporting/useCreateAlbumItemReport";

interface PhotoReportingProps {
  albumId: string;
  albumItemId: string;
}

export function PhotoReporting({ albumId, albumItemId }: PhotoReportingProps) {
  const auth = useAuth();
  const reporterId = auth.token?.claims.campminderId as number | undefined;

  const [reportMessage, setReportMessage] = useState("");
  const createReport = useCreateAlbumItemReport();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reporterId === undefined) return;
    try {
      await createReport.mutateAsync({
        albumId,
        albumItemId,
        reporterId,
        reportMessage: reportMessage.trim(),
      });
    } catch {
      // Surfaced via createReport.isError below
    }
  };

  const handleClose = () => modals.closeAll();

  if (createReport.isSuccess) {
    return (
      <Stack align="center" gap="md" px={56} py={40} className="w-[576px]">
        <MdFlag size={48} className="text-green-5" />
        <Title order={3} className="text-center">Report sent!</Title>
        <Text c="neutral.5" ta="center">
          Our team will review your issue and email you soon
        </Text>
        <Button color="gray" className="text-black" w={216} onClick={handleClose}>
          Close
        </Button>
      </Stack>
    );
  }

  if (createReport.isError) {
    return (
      <Stack align="center" gap="md" px={56} py={40} className="w-[576px]">
        <MdError size={48} className="text-error" />
        <Title order={3} className="text-center">Error reporting</Title>
        <Text c="neutral.5" ta="center">
          Please try again later or contact support
        </Text>
        <Group>
          <Button color="gray" className="text-black" w={200} onClick={handleClose}>
            Close
          </Button>
          <Button color="blue" w={200} onClick={() => createReport.reset()}>
            Try again
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack align="center" gap="lg" px={56} py={40} className="w-[576px]">
        <Stack align="center" gap="xs">
          <Title order={3} className="text-center">Report a photo</Title>
          <Text c="neutral.5" ta="center">
            We will share your issue with the team for review
          </Text>
        </Stack>
        <Textarea
          autosize
          minRows={5}
          maxRows={5}
          w="100%"
          placeholder="Describe your issue"
          value={reportMessage}
          onChange={(e) => setReportMessage(e.currentTarget.value)}
          disabled={createReport.isPending}
        />
        <Group>
          <Button
            color="gray"
            className="text-black"
            w={216}
            onClick={handleClose}
            disabled={createReport.isPending}
          >
            Close
          </Button>
          <Button
            type="submit"
            color="green"
            w={216}
            loading={createReport.isPending}
            disabled={!reportMessage.trim() || reporterId === undefined}
          >
            Report
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function openPhotoReportingModal(albumId: string, albumItemId: string) {
  modals.open({
    withCloseButton: false,
    classNames: { header: "hidden", body: "p-0" },
    centered: true,
    size: 576,
    children: <PhotoReporting albumId={albumId} albumItemId={albumItemId} />,
  });
}
