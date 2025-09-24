import { AlbumID } from "@/types/albumTypes";
import Link from "next/link";
import Image from "next/image";

interface AlbumCardProps {
  album: AlbumID;
  thumbnail: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  thumbnail,
}: AlbumCardProps) => {
  const { name, startDate, endDate, numPhotos, id } = album;
  return (
    <Link href={`/albums/${id}`}>
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
        <Image
          src={thumbnail}
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
            {startDate} - {endDate} • {numPhotos} photos
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
