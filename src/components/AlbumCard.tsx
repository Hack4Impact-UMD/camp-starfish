import { Image, Text, Title } from "@mantine/core";
import useAlbumById from "@/hooks/albums/useAlbumById";
import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import testImage from "./test.jpg";
import { useRouter } from "next/navigation";

interface AlbumCardProps {
  albumId: string;
}

export default function AlbumCard(props: AlbumCardProps) {
  const { albumId } = props;
  const albumQuery = useAlbumById(albumId);

  const router = useRouter();

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else if (albumQuery.isPending) {
    return <LoadingPage></LoadingPage>;
  }

  const { name, startDate, endDate, numItems, id } = albumQuery.data;
  return (
    <div
      className="bg-neutral-0 shadow-md hover:shadow-lg duration-300 p-4 cursor-pointer"
      onDoubleClick={() => router.push(`/albums/${id}`)}
    >
      <Image
        src={testImage}
        alt={name}
        className="w-full h-48 object-contain"
        width={200}
        height={48}
      />
      <div className="mt-2">
        <Title order={3}>{name}</Title>
        <Text>
          {startDate} - {endDate} • {numItems} photos
        </Text>
      </div>
    </div>
  );
}
