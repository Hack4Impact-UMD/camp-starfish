import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Camper, Parent } from "@/types/users/userTypes";

export interface ProcessFamilyCSVRequest {
  campers: Pick<Camper, "id" | "name" | "parentIds" | "gender" | "dateOfBirth">[];
  parents: Pick<Parent, "id" | "name" | "email" | "camperIds" | "gender" | "dateOfBirth">[];
}

async function processFamilyCSV(req: ProcessFamilyCSVRequest) {
  await httpsCallable(functions, "handleFamilyCSVUpload")(req);
}

export default function useProcessFamilyCSV() {
  return useMutation({
    mutationFn: (req: ProcessFamilyCSVRequest) => processFamilyCSV(req)
  })
}