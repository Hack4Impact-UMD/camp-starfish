import { createAlbumDoc, deleteAlbumDoc } from "@/data/firestore/albums";
import { uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation } from "@tanstack/react-query";

interface CreateAlbumDTO {
  name: string;
  thumbnail?: File;
  linkedSessionId?: string;
}

async function createAlbum(dto: CreateAlbumDTO) {
  const albumId = await createAlbumDoc({
    name: dto.name,
    numItems: 0,
    startDate: null,
    endDate: null,
    linkedSessionId: dto.linkedSessionId
  });
  try {
    if (dto.thumbnail) {
      await uploadFile(dto.thumbnail, `albums/${albumId}/thumbnail`);
    }
  } catch {
    await deleteAlbumDoc(albumId);
  }
}

export default function useCreateAlbum() {
  return useMutation({
    mutationFn: async (dto: CreateAlbumDTO) => createAlbum(dto)
  })
}