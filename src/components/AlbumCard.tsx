import Link from "next/link";
import Image from "next/image";
import useAlbumById from "@/hooks/albums/useAlbumById";
import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";

interface AlbumCardProps {
  albumId: string;
}

export default function AlbumCard(props: AlbumCardProps) {
  const { albumId } = props;
  const albumQuery = useAlbumById(albumId);

  if (albumQuery.isError) {
    return <ErrorPage error={albumQuery.error} />;
  } else if (albumQuery.isPending) {
    return <LoadingPage></LoadingPage>
  }

  const { name, startDate, endDate, numItems, id } = albumQuery.data;
  return (
    <Link href={`/albums/${id}`}>
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
        <Image
          src={null}
          alt={name}
          className="w-full h-48 object-cover rounded-lg"
          width={200}
          height={48}
        />
        <div className="mt-2">
          <h3 className="text-lg font-bold font-lato text-camp-text-headingBody">
            {name}
          </h3>
          <p className="text-sm font-lato text-camp-text-subheading">
            {startDate} - {endDate} • {numItems} photos
          </p>
        </div>
      </div>
    </Link>
  );
}