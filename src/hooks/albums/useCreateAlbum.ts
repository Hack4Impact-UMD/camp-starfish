import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAlbum } from "@/data/firestore/albums";
import { Album } from "@/types/albumTypes";
import useNotifications from "@/features/notifications/useNotifications";

export default function useCreateAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (data: Album) => setAlbum(data),

    onSuccess: (albumId: string) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      success("Album created successfully!");

      // Prime the cache for the new album if needed later
      // by invalidating the specific album query key
      queryClient.invalidateQueries({ queryKey: ["album", albumId] });
    },

    onError: (err: Error) => {
      console.error("Error creating album:", err);
      error(err?.message || "Failed to create album.");
    },
  });
}
