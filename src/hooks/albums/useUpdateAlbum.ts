import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAlbum } from "@/data/firestore/albums";
import { Album } from "@/types/albumTypes";
import useNotifications from "@/features/notifications/useNotifications";

interface UseUpdateAlbumVariables {
  id: string;
  updates: Partial<Album>;
}

export default function useUpdateAlbum() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async ({ id, updates }: UseUpdateAlbumVariables) =>
      updateAlbum(id, updates),

    onSuccess: (_, { id }) => {
      // Refresh album detail and any album lists
      queryClient.invalidateQueries({ queryKey: ["album", id] });
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      success("Album updated successfully!");
    },

    onError: (err: Error) => {
      console.error("Error updating album:", err);
      error(err?.message || "Failed to update album.");
    },
  });
}
