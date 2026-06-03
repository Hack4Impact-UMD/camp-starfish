import { JSX, useEffect, useState } from "react";
import PendingAlbumItemCard from "@/components/PendingAlbumItemCard";
import CardGallery from "@/components/CardGallery";
import useAlbumItemList from "@/hooks/albumItems/useAlbumItemList";
import ErrorPage from "@/app/error";
import LoadingAnimation from "@/components/LoadingAnimation";
import LoadingPage from "@/app/loading";
import { MdArrowBack, MdError, MdSort } from "react-icons/md";
import {
  ActionIcon,
  Anchor,
  Button,
  Menu,
  Title,
  Tooltip,
} from "@mantine/core";
import useAlbum from "@/hooks/albums/useAlbum";
import {
  AlbumItemSortOption,
  albumItemSortOptionQueryOptions,
} from "../AlbumPage";
import openConfirmationModal from "@/components/modals/ConfirmationModal";
import useApprovePendingAlbumItems from "@/hooks/albumItems/pendingItems/useApprovePendingAlbumItems";
import useRejectPendingAlbumItems from "@/hooks/albumItems/pendingItems/useRejectPendingAlbumItems";
import { useInViewport } from "@mantine/hooks";

interface PendingPageProps {
  albumId: string;
}

export default function PendingPage(props: PendingPageProps) {
  const { albumId } = props;

  const [sortOption, setSortOption] = useState<AlbumItemSortOption>(
    AlbumItemSortOption.NEWEST_TO_OLDEST,
  );

  const albumQuery = useAlbum(albumId);
  const pendingAlbumItemsQuery = useAlbumItemList(albumId, {
    where: [{ fieldPath: "inReview", operation: "==", value: true }],
    ...albumItemSortOptionQueryOptions[sortOption],
    limit: 10,
    limitToLast: undefined,
  });

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } =
    pendingAlbumItemsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const approvePendingAlbumItemsMutation = useApprovePendingAlbumItems();
  const rejectPendingAlbumItemsMutation = useRejectPendingAlbumItems();

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else if (albumQuery.isPending || pendingAlbumItemsQuery.isPending) {
    return <LoadingPage />;
  }

  const album = albumQuery.data;

  let albumItemContent: JSX.Element;
  if (pendingAlbumItemsQuery.isError) {
    albumItemContent = (
      <div className="flex flex-row justify-center items-center grow bg-neutral-3 gap-4">
        <MdError className="text-error" size={30} />
        <Title order={4}>Unable to fetch items!</Title>
      </div>
    );
  } else if (pendingAlbumItemsQuery.isPending) {
    albumItemContent = (
      <div className="flex flex-row justify-center items-center grow bg-neutral-3 gap-4">
        <LoadingAnimation />
      </div>
    );
  } else {
    const pendingAlbumItems = pendingAlbumItemsQuery.data.pages.flatMap(
      (page) => page.docs,
    );
    const pendingAlbumItemIds = pendingAlbumItems.map((item) => item.id);
    if (pendingAlbumItems.length === 0) {
      albumItemContent = (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No pending items!</Title>
        </div>
      );
    } else {
      albumItemContent = (
        <>
          <CardGallery
            items={pendingAlbumItems}
            renderItem={(item, isSelected) => (
              <PendingAlbumItemCard
                albumId={item.albumId}
                albumItemId={item.id}
                albumItemIds={pendingAlbumItemIds}
                isSelected={isSelected}
              />
            )}
          />
          {!pendingAlbumItemsQuery.hasNextPage && (
            <Title order={4} classNames={{ root: "self-center" }}>
              All Done!
            </Title>
          )}
          <div className="invisible" ref={ref} />
        </>
      );
    }
  }

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <div className="flex gap-xs items-center">
            <Anchor href={`/albums/${album.id}`}>
              <ActionIcon variant="transparent">
                <MdArrowBack size={40} />
              </ActionIcon>
            </Anchor>
            <Title order={1} className="text-[28px] font-bold text-navy-9">
              Pending
            </Title>
          </div>

          <div className="flex items-center gap-4">
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
            <Button
              color="green"
              onClick={() =>
                openConfirmationModal({
                  title: `Are you sure you want to approve all pending items in ${album.name}?`,
                  message: "WARNING: This action cannot be easily undone.",
                  onConfirm: () =>
                    approvePendingAlbumItemsMutation.mutate({ albumId }),
                })
              }
            >
              Approve All
            </Button>
            <Button
              color="error"
              onClick={() =>
                openConfirmationModal({
                  title: `Are you sure you want to reject all pending items in ${album.name}?`,
                  message: "WARNING: This action cannot be easily undone.",
                  onConfirm: () =>
                    rejectPendingAlbumItemsMutation.mutate({ albumId }),
                })
              }
            >
              Reject All
            </Button>
          </div>
        </div>
      </div>
      {albumItemContent}
    </div>
  );
}
