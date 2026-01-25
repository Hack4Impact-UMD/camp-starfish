import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAlbum } from "@/data/firestore/albums";
import useNotifications from "@/features/notifications/useNotifications";

export default function useDeleteAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (albumId: string) => deleteAlbum(albumId),

    onSuccess: () => {
      // Refresh album lists; specific album queries will refetch if mounted
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      success("Album deleted successfully!");
    },

    onError: (err: Error) => {
      console.error("Error deleting album:", err);
      error(err?.message || "Failed to delete album.");
    },
  });
}
