import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setImage } from "@/data/firestore/images";
import { ImageMetadata } from "@/types/albumTypes";
import useNotifications from "@/features/notifications/useNotifications";

interface UseSetImageVariables {
  albumId: string;
  imageId: string;
  data: ImageMetadata;
}

export default function useSetImage() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async ({ albumId, imageId, data }: UseSetImageVariables) =>
      setImage(albumId, imageId, data),

    onSuccess: (_, { albumId, imageId }) => {
      // Invalidate image detail and any album image lists
      queryClient.invalidateQueries({
        queryKey: ["albums", albumId, "images", imageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["albums", albumId, "images"],
      });
      success("Image saved successfully!");
    },

    onError: (err: Error) => {
      console.error("Error saving image:", err);
      error(err?.message || "Failed to save image.");
    },
  });
}
