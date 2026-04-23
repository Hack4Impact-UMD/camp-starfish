import { updateAlbumDoc } from "@/data/firestore/albums";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { deleteFile, uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation } from "@tanstack/react-query";
import { PartialWithFieldValue } from "firebase/firestore";

interface UpdateAlbumRequest {
  albumId: string;
  name?: string;
  thumbnail?: File | null;
}

async function updateAlbum(dto: UpdateAlbumRequest): Promise<void> {
  const { albumId, ...rest } = dto;
  const updates: PartialWithFieldValue<AlbumDoc> = {};
  if ('name' in dto) { updates.name = rest.name; }

  const promises = [];
  if (Object.keys(updates).length !== 0) { promises.push(updateAlbumDoc(albumId, updates)); }
  if (dto.thumbnail) {
    promises.push(uploadFile(dto.thumbnail, `albums/${albumId}/thumbnail`));
  } else if (dto.thumbnail === null) {
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
    mutationFn: (dto: UpdateAlbumRequest) => updateAlbum(dto)
  })
}