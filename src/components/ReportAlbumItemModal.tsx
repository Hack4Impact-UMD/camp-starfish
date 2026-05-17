"use client";

import { useState } from "react";
import { Button, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { MdFlag } from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import useCreateAlbumItemReport from "@/features/albums/albumItemReporting/useCreateAlbumItemReport";

interface ReportAlbumItemModalProps {
  albumId: string;
  albumItemId: string;
}

export function ReportAlbumItemModal(props: ReportAlbumItemModalProps) {
  const { albumId, albumItemId } = props;

  const auth = useAuth();
  const reporterId = auth.token?.claims.campminderId as number | undefined;

  const [reportMessage, setReportMessage] = useState("");
  const createAlbumItemReportMutation = useCreateAlbumItemReport();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (reporterId === undefined) return;
    createAlbumItemReportMutation.mutate({
      albumId,
      albumItemId,
      reporterId,
      reportMessage: reportMessage.trim(),
    });
  };

  const handleClose = () => modals.closeAll();

  if (createAlbumItemReportMutation.isSuccess) {
    return (
      <Stack className="items-center gap-md px-lg py-xl">
        <MdFlag size={48} className="text-green" />
        <Title order={3} className="text-center">
          Report sent!
        </Title>
        <Text className="text-neutral text-center">
          Our team will review your issue and email you soon
        </Text>
        <Button color="gray" className="text-black"
          onClick={handleClose}
        >
          Close
        </Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack className="items-center gap-lg px-xl py-xl">
          <Title order={3} className="text-center">
            Report a photo
          </Title>
          <Text  className="text-neutral text-center">
            We will share your issue with the team for review
          </Text>
        <Textarea
          autosize
          minRows={5}
          className="w-full"
          placeholder="Describe your issue"
          value={reportMessage}
          onChange={(e) => setReportMessage(e.currentTarget.value)}
          disabled={createAlbumItemReportMutation.isPending}
        />
        <Group className="flex flex-row justify-center w-full">
          <Button
            color="gray"
            className="w-1/3 text-black"
            onClick={handleClose}
            disabled={createAlbumItemReportMutation.isPending}
          >
            Close
          </Button>
          <Button
            type="submit"
            color="green"
            className="w-1/3"
            loading={createAlbumItemReportMutation.isPending}
            disabled={!reportMessage.trim() || reporterId === undefined}
          >
            Report
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function openPhotoReportingModal(
  albumId: string,
  albumItemId: string,
) {
  modals.open({
    title: "Report Item",
    children: <ReportAlbumItemModal albumId={albumId} albumItemId={albumItemId} />,
    centered: true,
    size: "lg",
  });
}
