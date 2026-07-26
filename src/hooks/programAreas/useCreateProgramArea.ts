import { createProgramAreaDoc } from "@/data/firestore/programAreas";
import { AgeGroup } from "@/types/sessions/sessionTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";

interface CreateProgramAreaRequest {
  name: string;
  description?: string;
  ageGroups?: AgeGroup[];
}

export default function useCreateProgramArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description = "", ageGroups = ["OCP", "NAV"] }: CreateProgramAreaRequest) =>
      createProgramAreaDoc(uuid(), { name, description, isDeleted: false, ageGroups }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programAreas"] }),
  });
}
