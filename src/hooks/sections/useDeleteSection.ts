import { deleteSectionDoc } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";

interface DeleteSectionRequest {
  sessionId: string;
  sectionId: string;
}

async function deleteSection(req: DeleteSectionRequest) {
  const { sessionId, sectionId } = req;
  await deleteSectionDoc(sessionId, sectionId);
}

export default function useDeleteSection() {
  return useMutation({
    mutationFn: (req : DeleteSectionRequest) => deleteSection(req)
  });
}
