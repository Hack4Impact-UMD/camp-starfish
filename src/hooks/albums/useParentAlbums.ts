import { batchGetAlbumDocs } from "@/data/firestore/albums";
import { listSessionAlbumDocs } from "@/data/firestore/sessionAlbums";
import { getUserDoc } from "@/data/firestore/users";
import { Album } from "@/types/albums/albumTypes";
import { useQuery } from "@tanstack/react-query";

// Firestore caps `array-contains-any` at 30 comparison values.
const ARRAY_CONTAINS_ANY_LIMIT = 30;

/**
 * Resolves the albums a parent is allowed to see: the albums linked to the
 * sessions that one of the parent's campers attends. Returns an empty list for
 * parents with no campers or no linked-album sessions.
 */
export default function useParentAlbums(campminderId: number | undefined) {
  return useQuery({
    queryKey: ["parentAlbums", campminderId],
    enabled: campminderId !== undefined,
    queryFn: async (): Promise<Album[]> => {
      // A parent whose user record isn't provisioned simply has no albums to
      // show; surface an empty state rather than crashing the page.
      let user;
      try {
        user = await getUserDoc(campminderId!);
      } catch (error) {
        if (error instanceof Error && error.message === "Document not found") {
          return [];
        }
        throw error;
      }
      if (user.role !== "PARENT") return [];

      const camperIds = (user.camperIds ?? []).slice(0, ARRAY_CONTAINS_ANY_LIMIT);
      if (camperIds.length === 0) return [];

      // Read the narrow sessionAlbums projection (parents can't read full
      // session docs) to find the albums linked to their campers' sessions.
      const sessionAlbums = await listSessionAlbumDocs({
        where: [
          { fieldPath: "attendeeIds", operation: "array-contains-any", value: camperIds },
        ],
      });

      const albumIds = sessionAlbums.docs
        .map((sessionAlbum) => sessionAlbum.linkedAlbumId)
        .filter((id): id is string => !!id);
      if (albumIds.length === 0) return [];

      return batchGetAlbumDocs(albumIds);
    },
  });
}
