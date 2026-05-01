"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Group,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  MdAdd,
  MdDownload,
  MdFilterList,
  MdSearch,
} from "react-icons/md";
import Link from "next/link";

import ImageCard from "@/components/ImageCard";
import CardGallery from "@/components/CardGallery";
import FileUploadModal from "@/components/FileUploadModal";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import { AlbumItem } from "@/types/albums/albumTypes";
import useAlbum from "@/hooks/albums/useAlbum";
import useAlbumItems from "@/hooks/albumItems/useAlbumItems";
import useCreateAlbumItem from "@/hooks/albumItems/useCreateAlbumItem";
import useDownloadAlbum from "@/hooks/albums/useDownloadAlbum";
import useNotifications from "@/features/notifications/useNotifications";

const AlbumPage: React.FC = () => {
  const params = useParams<{ albumId: string }>();
  const albumId = params.albumId;

  const albumQuery = useAlbum(albumId);
  const albumItemsQuery = useAlbumItems(albumId);
  const createAlbumItemMutation = useCreateAlbumItem();
  const downloadMutation = useDownloadAlbum();
  const notifications = useNotifications();

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  }
  if (albumItemsQuery.isError) {
    return <ErrorPage error={albumItemsQuery.error} />;
  }
  if (albumQuery.isLoading || !albumQuery.data || albumItemsQuery.isLoading) {
    return <LoadingPage />;
  }

  const album = albumQuery.data;
  const items: AlbumItem[] = albumItemsQuery.data ?? [];

  async function uploadImages(files: File[]) {
    await Promise.all(
      files.map((file) =>
        createAlbumItemMutation.mutateAsync({
          albumId,
          albumItem: file,
          inReview: false,
        }),
      ),
    );
  }

  const handleDownloadAlbum = () => {
    if (downloadMutation.isPending) return;
    downloadMutation.mutate(album, {
      onSuccess: () => notifications.success(`Downloaded "${album.name}".`),
      onError: (error: Error) =>
        notifications.error(error.message || "Failed to download album."),
    });
  };

  return (
    <Stack className="w-6/7 grow mx-auto px-4 py-6" gap="lg">
      <Breadcrumbs>
        <Anchor component={Link} href="/albums">Albums</Anchor>
        <Title order={2} component="span">{album.name}</Title>
      </Breadcrumbs>

      <Group justify="space-between" align="center" wrap="nowrap">
        <Title order={1}>{album.name}</Title>
        <Group gap="md" wrap="nowrap">
          <TextInput
            placeholder="Search tags..."
            leftSection={<MdSearch size={18} />}
            radius="xl"
            classNames={{ root: "w-64" }}
          />
          <Tooltip label="Filter">
            <ActionIcon variant="outline" aria-label="Filter">
              <MdFilterList size={24} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Download album">
            <ActionIcon
              color="aqua.5"
              variant="filled"
              loading={downloadMutation.isPending}
              onClick={handleDownloadAlbum}
              aria-label="Download album"
            >
              <MdDownload size={24} />
            </ActionIcon>
          </Tooltip>
          <FileUploadModal
            onUpload={uploadImages}
            acceptedFileExtensions={[".jpg", ".png"]}
            maxFileSize={5}
          >
            <Tooltip label="Upload photos">
              <ActionIcon color="orange" aria-label="Upload photos">
                <MdAdd size={28} />
              </ActionIcon>
            </Tooltip>
          </FileUploadModal>
        </Group>
      </Group>

      {items.length === 0 ? (
        <Stack
          align="center"
          justify="center"
          gap="md"
          className="grow bg-neutral-2 py-16 rounded-md"
        >
          <Title order={4}>No photos yet</Title>
          <FileUploadModal
            onUpload={uploadImages}
            acceptedFileExtensions={[".jpg", ".png"]}
            maxFileSize={5}
          >
            <Button color="orange" rightSection={<MdAdd size={20} />}>Upload</Button>
          </FileUploadModal>
        </Stack>
      ) : (
        <CardGallery<AlbumItem>
          items={items}
          renderItem={(image: AlbumItem, isSelected: boolean) => (
            <ImageCard image={image} isSelected={isSelected} />
          )}
        />
      )}
    </Stack>
  );
};

export default AlbumPage;
