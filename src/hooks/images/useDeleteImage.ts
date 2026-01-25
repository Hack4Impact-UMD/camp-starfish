import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage } from "@/data/firestore/images";
import useNotifications from "@/features/notifications/useNotifications";

interface UseDeleteImageVariables {
  albumId: string;
  imageId: string;
}

export default function useDeleteImage() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async ({ albumId, imageId }: UseDeleteImageVariables) =>
      deleteImage(albumId, imageId),

    onSuccess: (_, { albumId }) => {
      // Refresh album image lists; specific image queries will refetch if mounted
      queryClient.invalidateQueries({
        queryKey: ["albums", albumId, "images"],
      });
      success("Image deleted successfully!");
    },

    onError: (err: Error) => {
      console.error("Error deleting image:", err);
      error(err?.message || "Failed to delete image.");
    },
  });
}
