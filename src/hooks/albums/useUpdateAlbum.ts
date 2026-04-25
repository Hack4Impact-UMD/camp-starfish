import { updateAlbumDoc } from "@/data/firestore/albums";
import { deleteFile, uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation } from "@tanstack/react-query";

interface UpdateAlbumRequest {
  albumId: string;
  name?: string;
  thumbnail?: File | null;
}

async function updateAlbum(req: UpdateAlbumRequest): Promise<void> {
  const { albumId, ...rest } = req;
  if (Object.values(rest).filter(value => value !== undefined).length === 0) {
    return;
  }

  const promises = [];
  promises.push(updateAlbumDoc(albumId, {
    name: req.name,
    hasThumbnail: req.thumbnail ? true : req.thumbnail === null ? false : undefined
  }));

  if (req.thumbnail) {
    promises.push(uploadFile(req.thumbnail, `albums/${albumId}/thumbnail`));
  } else if (req.thumbnail === null) {
    promises.push(deleteFile(`albums/${albumId}/thumbnail`));
  }

  try {
    await Promise.all(promises);
  } catch {
    throw Error("Failed to update album");
  }
}

export default function useUpdateAlbum() {
  return useMutation({
    mutationFn: (req: UpdateAlbumRequest) => updateAlbum(req)
  })
}