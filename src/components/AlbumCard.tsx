import { Image, Text, Title } from "@mantine/core";
import useAlbum from "@/hooks/albums/useAlbum";
import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import { useRouter } from "next/navigation";
import { Album } from "@/types/albums/albumTypes";
interface AlbumCardProps {
  albumId: string;
}

function getAlbumCardText(album: Album) {
  const { startDate, endDate, numItems } = album;
  if (!startDate || !endDate) {
    return `${numItems} items`;
  } else if (startDate.isSame(endDate, 'year')) {
    if (startDate.isSame(endDate, 'month')) {
      return `${startDate.format("MMMM YYYY")} • ${numItems} items`;
    }
    return `${startDate.format("MMMM")} - ${endDate.format("MMMM YYYY")} • ${numItems} items`;
  }
  return `${startDate.format("MMMM YYYY")} - ${endDate.format("MMMM YYYY")} • ${numItems} items`;
}

export default function AlbumCard(props: AlbumCardProps) {
  const { albumId } = props;
  const { albumQuery, thumbnailQuery } = useAlbum(albumId, { albumThumbnailURL: true });

  const router = useRouter();

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else if (albumQuery.isPending) {
    return <LoadingPage></LoadingPage>;
  }

  const album = albumQuery.data;
  return (
    <div
      className="bg-neutral-0 hover:bg-neutral-2 border border-neutral-3 shadow-sm hover:shadow-lg duration-300 p-4 cursor-pointer"
      onDoubleClick={() => router.push(`/albums/${album.id}`)}
    >
      <Image
        src={thumbnailQuery.data}
        alt={album.name}
        className="w-full h-48 object-contain"
        width={200}
        height={48}
      />
      <div className="mt-2">
        <Title order={3}>{album.name}</Title>
        <Text>{getAlbumCardText(albumQuery.data)}</Text>
      </div>
    </div>
  );
}
