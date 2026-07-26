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
import useAlbum from "@/hooks/albums/useAlbum";
import useAlbumItemList from "@/hooks/albumItems/useAlbumItemList";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Group,
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
import useDownloadAlbumItems from "@/features/albums/downloading/useDownloadAlbumItems";
import useDeleteAlbumItem from "@/hooks/albumItems/useDeleteAlbumItem";
import openConfirmationModal from "@/components/modals/ConfirmationModal";
import { useAuth } from "@/auth/useAuth";
import openUploadAlbumItemsModal from "@/components/UploadAlbumItemsModal/UploadAlbumItemsModal";
import { useInViewport } from "@mantine/hooks";
import LoadingAnimation from "@/components/LoadingAnimation";
import underline from "@/assets/underline.svg";

export const enum AlbumItemSortOption {
  NEWEST_TO_OLDEST = "Newest → Oldest",
  OLDEST_TO_NEWEST = "Oldest → Newest",
  A_TO_Z = "A → Z",
  Z_TO_A = "Z → A",
}

export const albumItemSortOptionQueryOptions: Record<
  AlbumItemSortOption,
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

  const { role } = useAuth();
  // Tagging, moderation, and uploading are staff/photographer features; parents
  // only view and download their camper's photos.
  const canManageAlbum =
    role === "ADMIN" || role === "STAFF" || role === "PHOTOGRAPHER";

  const [sortOption, setSortOption] = useState<AlbumItemSortOption>(
    AlbumItemSortOption.NEWEST_TO_OLDEST,
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const albumItemsQuery = useAlbumItemList(album.id, {
    where: [{ fieldPath: "inReview", operation: "==", value: false }],
    ...albumItemSortOptionQueryOptions[sortOption],
    limit: 10,
    limitToLast: undefined,
  });

  const pendingItemsQuery = useAlbumItemList(album.id, {
    where: [{ fieldPath: "inReview", operation: "==", value: true }],
    limit: 1,
    limitToLast: undefined,
  });
  const hasPendingItems =
    (pendingItemsQuery.data?.pages.flatMap((page) => page.docs).length ?? 0) > 0;

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = albumItemsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const downloadAlbumMutation = useDownloadAlbum();
  const downloadAlbumItemsMutation = useDownloadAlbumItems();
  const deleteAlbumItemMutation = useDeleteAlbumItem();

  if (albumItemsQuery.isPending) {
    return <LoadingPage />;
  } else if (albumItemsQuery.isError) {
    return <ErrorPage error={albumItemsQuery.error} />;
  }

  const albumItems =
    albumItemsQuery.data.pages.flatMap((page) => page.docs) || [];
  const albumItemIds = albumItems.map((item) => item.id);

  const clearSelection = () => setSelectedItemIds([]);
  const selectAll = () => setSelectedItemIds(albumItemIds);
  const downloadSelected = () =>
    downloadAlbumItemsMutation.mutate({ albumId: album.id, albumItemIds: selectedItemIds });
  const deleteSelected = () =>
    openConfirmationModal({
      title: `Delete ${selectedItemIds.length} item${selectedItemIds.length === 1 ? "" : "s"}?`,
      message: "WARNING: This action cannot be undone.",
      onConfirm: () => {
        selectedItemIds.forEach((albumItemId) =>
          deleteAlbumItemMutation.mutate({ albumId: album.id, albumItemId }),
        );
        clearSelection();
      },
    });

  const selectionToolbar = (
    <Group gap="xs" wrap="nowrap" className="rounded-full bg-navy-9 py-2 pl-5 pr-2">
      <Text className="font-medium text-white whitespace-nowrap">
        {selectedItemIds.length} selected
      </Text>
      <Button
        variant="white"
        color="navy.9"
        radius="xl"
        size="sm"
        onClick={selectAll}
        disabled={albumItemsQuery.hasNextPage}
        title={
          albumItemsQuery.hasNextPage
            ? "Scroll to load all photos before selecting all"
            : undefined
        }
      >
        Select All
      </Button>
      <Tooltip label="Download selected">
        <ActionIcon
          variant="outline"
          color="white"
          radius="xl"
          size={36}
          onClick={downloadSelected}
          loading={downloadAlbumItemsMutation.isPending}
          aria-label="Download selected"
        >
          <MdOutlineFileDownload size={18} />
        </ActionIcon>
      </Tooltip>
      {canManageAlbum && (
        <Tooltip label="Delete selected">
          <ActionIcon
            variant="outline"
            color="white"
            radius="xl"
            size={36}
            onClick={deleteSelected}
            aria-label="Delete selected"
          >
            <MdDelete size={18} />
          </ActionIcon>
        </Tooltip>
      )}
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
      <div className="flex items-start justify-between">
        <Breadcrumbs
          classNames={{
            root: "items-baseline",
            separator: "text-navy-9 text-[40px]",
          }}
          separator="»"
        >
          {[
            { title: "ALBUMS", href: "/albums" },
            { title: album.name, href: "#" },
          ].map((breadcrumb, index, breadcrumbs) => {
            const isCurrent = index === breadcrumbs.length - 1;
            return (
              <Anchor
                href={breadcrumb.href}
                key={breadcrumb.title}
                underline="never"
                className={`inline-block text-navy-9 text-[28px] leading-tight ${
                  isCurrent ? "font-bold" : "font-semibold"
                }`}
                style={
                  isCurrent
                    ? {
                        backgroundImage: `url(${underline.src})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "left bottom",
                        backgroundSize: "100% 0.55rem",
                        paddingBottom: "0.5rem",
                      }
                    : undefined
                }
              >
                {breadcrumb.title}
              </Anchor>
            );
          })}
        </Breadcrumbs>
        <div className="flex items-start gap-4 shrink-0">
          {canManageAlbum && <TagSelect />}
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
                AlbumItemSortOption.NEWEST_TO_OLDEST,
                AlbumItemSortOption.OLDEST_TO_NEWEST,
                AlbumItemSortOption.A_TO_Z,
                AlbumItemSortOption.Z_TO_A,
              ].map((option) => (
                <Menu.Item key={option} onClick={() => setSortOption(option)}>
                  {option}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          {canManageAlbum && (
            <Link href={`/albums/${album.id}/pending`}>
              <Tooltip label="Pending Items">
                <Indicator color="error" offset={7} disabled={!hasPendingItems}>
                  <ActionIcon variant="outline">
                    <MdPendingActions size={30} />
                  </ActionIcon>
                </Indicator>
              </Tooltip>
            </Link>
          )}
          {canManageAlbum && (
            <Tooltip label="Upload Items">
              <ActionIcon
                color="aqua"
                onClick={() => openUploadAlbumItemsModal(album.id)}
              >
                <MdOutlineFileUpload size={40} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Download Album">
            <ActionIcon
              color="aqua"
              onClick={() =>
                downloadAlbumMutation.mutate({
                  albumId: album.id,
                  queryOptions: albumItemSortOptionQueryOptions[sortOption],
                })
              }
            >
              <MdOutlineFileDownload size={40} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>

      {albumItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No items yet</Title>
          {canManageAlbum && (
            <Button
              color="aqua"
              rightSection={<MdOutlineFileUpload size={24} />}
              onClick={() => openUploadAlbumItemsModal(album.id)}
            >
              Upload Items
            </Button>
          )}
        </div>
      ) : (
        <>
          <CardGallery<AlbumItem>
            items={albumItems}
            selectedItemIds={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            firstGroupActions={
              selectedItemIds.length > 0 ? selectionToolbar : undefined
            }
            renderItem={(image: AlbumItem, isSelected: boolean) => (
              <AlbumItemCard
                albumId={album.id}
                albumItemId={image.id}
                albumItemIds={albumItemIds}
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
