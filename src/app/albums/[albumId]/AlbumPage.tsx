import React, { useState } from "react";
import {
  MdOutlineFileUpload,
  MdOutlineFileDownload,
  MdPendingActions,
} from "react-icons/md";
import Link from "next/link";
import AlbumItemCard from "@/components/AlbumItemCard";
import CardGallery from "@/components/CardGallery";
import Tagging from "@/components/Tagging";
import { Album, AlbumItem } from "@/types/albums/albumTypes";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import useAlbum from "@/hooks/albums/useAlbum";
import useAlbumItemsList from "@/hooks/albumItems/useAlbumItemsList";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Menu,
  Title,
  Tooltip,
} from "@mantine/core";
import { MdSort } from "react-icons/md";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import useDownloadAlbum from "@/features/albums/downloading/useDownloadAlbum";
import openUploadAlbumItemsModal from "@/components/UploadAlbumItemsModal/UploadAlbumItemsModal";

const allTags = [
  { id: "1", name: "Claire C." },
  { id: "2", name: "Nitin K." },
  { id: "3", name: "Ben E." },
  { id: "4", name: "Maia J." },
  { id: "5", name: "Harshitha J." },
  { id: "6", name: "Tej S." },
  { id: "7", name: "Advik D." },
  { id: "8", name: "Christine N." },
  { id: "9", name: "Esha V." },
  { id: "10", name: "Gelila K." },
  { id: "11", name: "Joel C." },
  { id: "12", name: "Nishtha D." },
  { id: "13", name: "Rivan P." },
  { id: "14", name: "Riya M." },
  { id: "15", name: "Saharsh M." },
];

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

  const [selectedTags, setSelectedTags] = useState<(typeof allTags)[0][]>([]);
  const [sortOption, setSortOption] = useState<AlbumPageSortOption>(
    AlbumPageSortOption.NEWEST_TO_OLDEST,
  );

  const albumItemsQuery = useAlbumItemsList(album.id, {
    ...sortQueryOptions[sortOption],
    limit: 10,
    limitToLast: undefined,
  });

  const downloadAlbumMutation = useDownloadAlbum();

  if (albumItemsQuery.isPending) {
    return <LoadingPage />;
  } else if (albumItemsQuery.isError) {
    return <ErrorPage error={albumItemsQuery.error} />;
  }

  const albumItems =
    albumItemsQuery.data.pages.flatMap((page) => page.docs) || [];

  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-4 shrink-0">
          {/* Tagging */}
          <Tagging
            items={allTags}
            selectedItems={selectedTags}
            onSelectionChange={setSelectedTags}
            getOptionLabel={(tag) => tag.name}
            getOptionValue={(tag) => tag.id}
            placeholder="Search Tags..."
            className="w-64 cursor-pointer"
          />

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
            <MdPendingActions />
          </Link>

          <Tooltip label="Upload Items">
            <ActionIcon color="aqua" onClick={() => openUploadAlbumItemsModal(album.id)}>
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
      </div>

      <CardGallery<AlbumItem>
        items={albumItems}
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
          groupFunc: (image: AlbumItem) => image.dateTaken.format("YYYY-MM-DD"),
        }}
      />
    </div>
  );
}
