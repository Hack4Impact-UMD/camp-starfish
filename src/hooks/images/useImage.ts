import { useQuery } from "@tanstack/react-query";
import { getImageById } from "@/data/firestore/images";
import { ImageMetadataID } from "@/types/albumTypes";

interface UseImageArgs {
  albumId?: string;
  imageId?: string;
}

export default function useImage({ albumId, imageId }: UseImageArgs) {
  const enabled = !!albumId && !!imageId;

  return useQuery<ImageMetadataID>({
    queryKey: ["albums", albumId, "images", imageId],
    queryFn: () => {
      if (!albumId || !imageId) {
        throw new Error("albumId and imageId are required to fetch image");
      }
      return getImageById(albumId, imageId);
    },
    enabled,
  });
}
