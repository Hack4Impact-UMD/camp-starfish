import React, { useState } from "react";
import PendingImageCard from "@/components/PendingImageCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import CardGallery, { GroupOptions } from "@/components/CardGallery";
import { useRouter } from "next/navigation";
import useAlbumItemList from "@/hooks/albumItems/useAlbumItemList";
import ErrorPage from "@/app/error";
import LoadingAnimation from "@/components/LoadingAnimation";
import { UploadAlbumItemsModal } from "@/components/UploadAlbumItemsModal/UploadAlbumItemsModal";
import { MdArrowBack, MdSort } from "react-icons/md";
import { AlbumItem } from "@/types/albums/albumTypes";
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
import { AlbumItemSortOption } from "../AlbumPage";

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
  });

  const router = useRouter();

  if (albumQuery.isError || pendingAlbumItemsQuery.isError) {
    return <ErrorPage error={pendingAlbumItemsQuery.error} />;
  } else if (albumQuery.isPending || pendingAlbumItemsQuery.isPending) {
    return <LoadingAnimation />;
  }

  const album = albumQuery.data;
  const pendingAlbumItems = pendingAlbumItemsQuery.data.pages.flatMap(
    (page) => page.docs,
  );

  const groups: GroupOptions<AlbumItem> = {
    groupLabels: ["album-1"],
    defaultGroupLabel: "Other",
    groupFunc: (photo) => photo.albumId,
  };

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex items-center justify-between">
        <Breadcrumbs classNames={{ separator: "text-3xl" }} separator=">>">
          {[
            { title: "ALBUMS", href: "/albums" },
            { title: album.name, href: `/albums/${album.id}` },
            { title: "Pending", href: "#" },
          ].map((breadcrumb) => (
            <Anchor href={breadcrumb.href} key={breadcrumb.title}>
              <Title order={1}>{breadcrumb.title}</Title>
            </Anchor>
          ))}
        </Breadcrumbs>

        <div className="flex items-center gap-4">
          <Button color="green">Approve All</Button>
          <Button color="error">Reject All</Button>
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

      {/* Photo Grid */}
      <div className="mt-6 space-y-8">
        {/* <CardGallery
          items={pendingAlbumItems}
          groups={groups}
          renderItem={(item) => (
            <PendingImageCard
              key={item.id}
              src={item.src}
              alt={`Thumbnail ${item.id}`}
              status="none"
              onApprove={() => console.log("Approve", item.id)}
              onReject={() => console.log("Reject", item.id)}
            />
          )}
        /> */}
      </div>
    </div>
  );
}
