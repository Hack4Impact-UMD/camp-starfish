import { ActionIcon, Card, Group, Image, Loader, Stack, Text, Title, Tooltip } from "@mantine/core";
import useAlbum from "@/hooks/albums/useAlbum";
import useDownloadAlbum from "@/features/albums/downloading/useDownloadAlbum";
import useNotifications from "@/features/notifications/useNotifications";
import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import { useRouter } from "next/navigation";
import { Album } from "@/types/albums/albumTypes";
import useAlbumThumbnailSrc from "@/hooks/albums/useAlbumThumbnailSrc";
import { MdDownload } from "react-icons/md";

interface AlbumCardProps {
  albumId: string;
  onEdit?: (albumID: string) => void;
  onDelete?: (albumID: string) => void;
}

function getAlbumCardText(album: Album) {
  const { startDate, endDate, numItems } = album;
  const itemsText = numItems === 1 ? `1 item` : `${numItems} items`;
  if (!startDate || !endDate) {
    return itemsText;
  } else if (startDate.isSame(endDate, "year")) {
    if (startDate.isSame(endDate, "month")) {
      return `${startDate.format("MMMM YYYY")} • ${itemsText}`;
    }
    return `${startDate.format("MMMM")} - ${endDate.format("MMMM YYYY")} • ${itemsText}`;
  }
  return `${startDate.format("MMMM YYYY")} - ${endDate.format("MMMM YYYY")} • ${itemsText}`;
}

export default function AlbumCard(props: AlbumCardProps) {
  const { albumId } = props;
  const albumQuery = useAlbum(albumId);
  const thumbnailSrcQuery = useAlbumThumbnailSrc(albumQuery.data);
  const downloadMutation = useDownloadAlbum();
  const notifications = useNotifications();

  const router = useRouter();

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else if (albumQuery.isPending) {
    return <LoadingPage></LoadingPage>;
  }

  const album = albumQuery.data;
  const isDownloading = downloadMutation.isPending;

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDownloading) return;
    downloadMutation.mutate({ albumId: album.id }, {
      onSuccess: () =>
        notifications.success(`Downloaded "${album.name}".`),
      onError: (error: Error) =>
        notifications.error(error.message || "Failed to download album."),
    });
  };

  return (
    <Card
      shadow="md"
      radius="sm"
      padding="md"
      withBorder
      classNames={{ root: "cursor-pointer hover:shadow-lg duration-300" }}
      onDoubleClick={() => router.push(`/albums/${album.id}`)}
    >
      <Card.Section className="relative">
        <Image
          src={thumbnailSrcQuery.data ?? null}
          alt={album.name}
          width={280}
          height={196}
          h={196}
          fit="cover"
          fallbackSrc="https://placehold.co/280x196?text=No+Thumbnail"
        />
        <Tooltip label={isDownloading ? "Downloading…" : "Download album"} withArrow>
          <ActionIcon
            color="aqua.5"
            variant="filled"
            size="lg"
            radius="xl"
            className="absolute top-2 right-2 shadow"
            onClick={handleDownload}
            loading={isDownloading}
            aria-label={`Download ${album.name}`}
          >
            {isDownloading ? <Loader size="xs" color="white" /> : <MdDownload size={20} />}
          </ActionIcon>
        </Tooltip>
      </Card.Section>
      <Stack gap={4} mt="sm">
        <Title order={3} lineClamp={1}>{album.name}</Title>
        <Group gap="xs">
          <Text size="sm" c="neutral.5">{getAlbumCardText(album)}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
