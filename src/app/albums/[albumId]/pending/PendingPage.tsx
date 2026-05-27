import { useEffect, useState } from "react";
import PendingAlbumItemCard from "@/components/PendingAlbumItemCard";
import CardGallery from "@/components/CardGallery";
import useAlbumItemList from "@/hooks/albumItems/useAlbumItemList";
import ErrorPage from "@/app/error";
import LoadingAnimation from "@/components/LoadingAnimation";
import { MdArrowBack, MdSort } from "react-icons/md";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
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

  if (albumQuery.isError || pendingAlbumItemsQuery.isError) {
    return (
      <ErrorPage error={albumQuery.error || pendingAlbumItemsQuery.error} />
    );
  } else if (albumQuery.isPending || pendingAlbumItemsQuery.isPending) {
    return <LoadingAnimation />;
  }

  const album = albumQuery.data;
  const pendingAlbumItems = pendingAlbumItemsQuery.data.pages.flatMap(
    (page) => page.docs,
  );

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex flex-col gap-xs">
        <Breadcrumbs separator=">>">
          {[
            { title: "ALBUMS", href: "/albums" },
            { title: album.name, href: `/albums/${album.id}` },
            { title: "Pending", href: "#" },
          ].map((breadcrumb) => (
            <Anchor href={breadcrumb.href} key={breadcrumb.title}>
              <Title order={6}>{breadcrumb.title}</Title>
            </Anchor>
          ))}
        </Breadcrumbs>

        <div className="flex items-center justify-between">
          <div className="flex gap-xs items-center">
            <Anchor href={`/albums/${album.id}`}>
              <ActionIcon variant="transparent">
                <MdArrowBack size={40} />
              </ActionIcon>
            </Anchor>
            <Title order={1}>Pending</Title>
          </div>

          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>

      {pendingAlbumItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No pending items!</Title>
        </div>
      ) : (
        <>
          <CardGallery
            items={pendingAlbumItems}
            renderItem={(item, isSelected) => (
              <PendingAlbumItemCard
                albumId={item.albumId}
                albumItemId={item.id}
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
      )}
    </div>
  );
}
