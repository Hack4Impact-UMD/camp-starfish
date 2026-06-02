import { createAlbumDoc, deleteAlbumDoc } from "@/data/firestore/albums";
import { uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateAlbumRequest {
  name: string;
  thumbnail?: File;
  linkedSessionId?: string;
}

async function createAlbum(req: CreateAlbumRequest) {
  const albumId = await createAlbumDoc({
    name: req.name,
    numItems: 0,
    startDate: null,
    endDate: null,
    hasThumbnail: !!req.thumbnail,
    linkedSessionId: req.linkedSessionId
  });
  try {
    if (req.thumbnail) {
      await uploadFile(req.thumbnail, `albums/${albumId}/thumbnail`);
    }
  } catch {
    await deleteAlbumDoc(albumId);
    throw Error("Failed to create album");
  }
}

export default function useCreateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateAlbumRequest) => createAlbum(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    }
  })
}