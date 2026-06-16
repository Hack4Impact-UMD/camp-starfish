import { listProgramAreaDocs } from "@/data/firestore/programAreas";
import { useQuery } from "@tanstack/react-query";

export default function useProgramAreas() {
  return useQuery({
    queryKey: ["programAreas", "list"],
    queryFn: () => listProgramAreaDocs(),
  });
}
