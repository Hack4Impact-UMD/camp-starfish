import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AlbumItemTagMutationVariables {
  albumId: string;
  albumItemId: string;
}

// Shared wrapper for the tag mutation hooks: every tag change invalidates the
// affected album item's query so the cache strategy lives in one place.
export default function useAlbumItemTagMutation<TVariables extends AlbumItemTagMutationVariables>(
  mutationFn: (variables: TVariables) => Promise<void>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums', variables.albumId, 'albumItems', variables.albumItemId] });
    }
  });
}
