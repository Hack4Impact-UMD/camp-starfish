import React, { useEffect, useState } from "react";
import {
  MdOutlineFileUpload,
  MdOutlineFileDownload,
  MdPendingActions,
  MdDelete,
  MdClose,
} from "react-icons/md";
import Link from "next/link";
import AlbumItemCard from "@/components/AlbumItemCard";
import CardGallery from "@/components/CardGallery";
import TagSelect from "@/components/TagSelect";
import { Album, AlbumItem } from "@/types/albums/albumTypes";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import useAlbum from "@/hooks/albums/useAlbum";
import useAlbumItemsList from "@/hooks/albumItems/useAlbumItemsList";
import { getAlbumItemBlob } from "@/hooks/albumItems/useAlbumItemBlob";
import { downloadFilesLocally } from "@/hooks/useDownloadFilesLocally";
import useNotifications from "@/features/notifications/useNotifications";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Indicator,
  Menu,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { MdSort } from "react-icons/md";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import useDownloadAlbum from "@/features/albums/downloading/useDownloadAlbum";
import openUploadAlbumItemsModal from "@/components/UploadAlbumItemsModal/UploadAlbumItemsModal";
import { useInViewport } from "@mantine/hooks";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const enum AlbumPageSortOption {
  NEWEST_TO_OLDEST = "Newest → Oldest",
  OLDEST_TO_NEWEST = "Oldest → Newest",
  A_TO_Z = "A → Z",
  Z_TO_A = "Z → A",
}

const sortQueryOptions: Record<
  AlbumPageSortOption,
  FirestoreQueryOptions<AlbumItemDoc>
> = {
  "Newest → Oldest": {
    orderBy: [{ fieldPath: "dateTaken", direction: "desc" }],
  },
  "Oldest → Newest": {
    orderBy: [{ fieldPath: "dateTaken", direction: "asc" }],
  },
  "A → Z": { orderBy: [{ fieldPath: "name", direction: "asc" }] },
  "Z → A": { orderBy: [{ fieldPath: "name", direction: "desc" }] },
};

interface AlbumPageProps {
  albumId: string;
}

export default function AlbumPage(props: AlbumPageProps) {
  const { albumId } = props;

  const albumQuery = useAlbum(albumId);
  if (albumQuery.isPending) {
    return <LoadingPage />;
  } else if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else {
    return <AlbumPageContent album={albumQuery.data} />;
  }
}

interface AlbumPageContentProps {
  album: Album;
}

export function AlbumPageContent(props: AlbumPageContentProps) {
  const { album } = props;

  // ── All hooks must be called unconditionally before any early returns ──
  const [sortOption, setSortOption] = useState<AlbumPageSortOption>(
    AlbumPageSortOption.NEWEST_TO_OLDEST,
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const albumItemsQuery = useAlbumItemsList(album.id, {
    ...sortQueryOptions[sortOption],
    limit: 10,
    limitToLast: undefined,
  });

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = albumItemsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const downloadAlbumMutation = useDownloadAlbum();
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  // Derive albumItems before early returns so mutation closures can reference it
  const albumItems: AlbumItem[] =
    albumItemsQuery.data?.pages.flatMap((page) => page.docs) ?? [];

  const downloadSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const selectedItems = albumItems.filter((item) => ids.includes(item.id));
      const blobs = await Promise.all(
        selectedItems.map((item) =>
          queryClient.fetchQuery({
            queryKey: ["albums", album.id, "albumItems", item.id, "blob"],
            queryFn: () => getAlbumItemBlob(album.id, item.id),
          })
        )
      );
      await downloadFilesLocally({
        items: selectedItems.map((item, i) => ({
          blob: blobs[i],
          filename: item.name,
        })),
        zipFileName: `${album.name}-selected.zip`,
      });
    },
    onSuccess: (_, ids) =>
      notifications.success(`Downloaded ${ids.length} item${ids.length !== 1 ? "s" : ""}.`),
    onError: () => notifications.error("Failed to download selected items."),
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteAlbumItemDoc(album.id, id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({
        queryKey: ["albums", album.id, "albumItems"],
      });
      setSelectedItemIds([]);
      notifications.success(`Deleted ${ids.length} item${ids.length !== 1 ? "s" : ""}.`);
    },
    onError: () => notifications.error("Failed to delete selected items."),
  });
  // ── End of hooks ──

  if (albumItemsQuery.isPending) {
    return <LoadingPage />;
  } else if (albumItemsQuery.isError) {
    return <ErrorPage error={albumItemsQuery.error} />;
  }

  // Selection handlers
  const handleToggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleGroup = (label: string, checked: boolean) => {
    const groupItems = albumItems.filter(
      (item) => item.dateTaken.format("YYYY-MM-DD") === label
    );
    setSelectedItemIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...groupItems.map((item) => item.id)]));
      }
      return prev.filter((id) => !groupItems.some((item) => item.id === id));
    });
  };

  const handleSelectAll = () =>
    setSelectedItemIds(albumItems.map((item) => item.id));

  const handleClearSelection = () => setSelectedItemIds([]);

  const selectionActive = selectedItemIds.length > 0;

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex items-start justify-between">
        <Breadcrumbs classNames={{ separator: "text-3xl" }} separator=">>">
          {[
            { title: "ALBUMS", href: "/albums" },
            { title: album.name, href: `#` },
          ].map((breadcrumb) => (
            <Anchor href={breadcrumb.href} key={breadcrumb.title}>
              <Title order={1}>{breadcrumb.title}</Title>
            </Anchor>
          ))}
        </Breadcrumbs>

        {selectionActive ? (
          <div className="flex items-center gap-2 bg-[#002d45] rounded-md px-4 py-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0">
            <Text c="white" fw={700} size="sm" className="px-1 whitespace-nowrap">
              {selectedItemIds.length} selected
            </Text>
            <Button
              variant="outline"
              color="white"
              radius="xl"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Tooltip label="Download selected" withArrow>
              <Button
                variant="outline"
                color="white"
                radius="xl"
                size="sm"
                px="sm"
                onClick={() => downloadSelectedMutation.mutate(selectedItemIds)}
                loading={downloadSelectedMutation.isPending}
                aria-label="Download selected items"
              >
                <MdOutlineFileDownload size={16} />
              </Button>
            </Tooltip>
            <Tooltip label="Delete selected" withArrow>
              <Button
                variant="outline"
                color="white"
                radius="xl"
                size="sm"
                px="sm"
                onClick={() => deleteSelectedMutation.mutate(selectedItemIds)}
                loading={deleteSelectedMutation.isPending}
                aria-label="Delete selected items"
              >
                <MdDelete size={16} />
              </Button>
            </Tooltip>
            <ActionIcon
              variant="transparent"
              color="white"
              size="md"
              radius="xl"
              onClick={handleClearSelection}
              aria-label="Clear selection"
            >
              <MdClose size={16} />
            </ActionIcon>
          </div>
        ) : (
          <div className="flex items-start gap-4 shrink-0">
            <TagSelect />
            <Menu>
              <Tooltip label="Sort">
                <Menu.Target>
                  <ActionIcon variant="transparent">
                    <MdSort size={50} />
                  </ActionIcon>
                </Menu.Target>
              </Tooltip>
              <Menu.Dropdown>
                {[
                  AlbumPageSortOption.NEWEST_TO_OLDEST,
                  AlbumPageSortOption.OLDEST_TO_NEWEST,
                  AlbumPageSortOption.A_TO_Z,
                  AlbumPageSortOption.Z_TO_A,
                ].map((option) => (
                  <Menu.Item key={option} onClick={() => setSortOption(option)}>
                    {option}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Link href="/albums/pending">
              <Tooltip label="Pending Items">
                <Indicator color="error" offset={7}>
                  <ActionIcon variant="outline">
                    <MdPendingActions size={30} />
                  </ActionIcon>
                </Indicator>
              </Tooltip>
            </Link>
            <Tooltip label="Upload Items">
              <ActionIcon
                color="aqua"
                onClick={() => openUploadAlbumItemsModal(album.id)}
              >
                <MdOutlineFileUpload size={40} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Download Album">
              <ActionIcon
                color="aqua"
                onClick={() =>
                  downloadAlbumMutation.mutate({
                    albumId: album.id,
                    queryOptions: sortQueryOptions[sortOption],
                  })
                }
              >
                <MdOutlineFileDownload size={40} />
              </ActionIcon>
            </Tooltip>
          </div>
        )}
      </div>

      {albumItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No items yet</Title>
          <Button
            color="aqua"
            rightSection={<MdOutlineFileUpload size={24} />}
            onClick={() => openUploadAlbumItemsModal(album.id)}
          >
            Upload Items
          </Button>
        </div>
      ) : (
        <>
          <CardGallery<AlbumItem>
            items={albumItems}
            selectedItemIds={selectedItemIds}
            onToggleItem={handleToggleItem}
            onToggleGroup={handleToggleGroup}
            renderItem={(image: AlbumItem, isSelected: boolean) => (
              <AlbumItemCard
                albumId={album.id}
                albumItemId={image.id}
                isSelected={isSelected}
              />
            )}
            groups={{
              groupLabels: [
                ...new Set(
                  albumItems.map((item) => item.dateTaken.format("YYYY-MM-DD")),
                ),
              ],
              defaultGroupLabel: "Date Unknown",
              groupFunc: (image: AlbumItem) =>
                image.dateTaken.format("YYYY-MM-DD"),
            }}
          />
          {albumItemsQuery.isFetchingNextPage && (
            <div className="w-1/3 self-center">
              <LoadingAnimation />
            </div>
          )}
          {!albumItemsQuery.hasNextPage && (
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
