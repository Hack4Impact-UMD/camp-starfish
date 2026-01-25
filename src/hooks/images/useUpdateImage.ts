import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateImage } from "@/data/firestore/images";
import { ImageMetadata } from "@/types/albumTypes";
import useNotifications from "@/features/notifications/useNotifications";

interface UseUpdateImageVariables {
  albumId: string;
  imageId: string;
  updates: Partial<ImageMetadata>;
}

export default function useUpdateImage() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async ({ albumId, imageId, updates }: UseUpdateImageVariables) =>
      updateImage(albumId, imageId, updates),

    onSuccess: (_, { albumId, imageId }) => {
      queryClient.invalidateQueries({
        queryKey: ["albums", albumId, "images", imageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["albums", albumId, "images"],
      });
      success("Image updated successfully!");
    },

    onError: (err: Error) => {
      console.error("Error updating image:", err);
      error(err?.message || "Failed to update image.");
    },
  });
}
