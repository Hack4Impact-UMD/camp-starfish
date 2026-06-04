import { updateProgramAreaDoc } from "@/data/firestore/programAreas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Soft-delete: program areas keep their doc (referenced by activities) but are
// flagged so they no longer appear as selectable categories.
export default function useDeleteProgramArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateProgramAreaDoc(id, { isDeleted: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programAreas"] }),
  });
}
