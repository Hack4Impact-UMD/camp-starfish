import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Camper } from "@/types/users/userTypes";

export interface ProcessFamilyCsvRequest {
  campers: Pick<Camper, "id" | "name" | "gender" | "dateOfBirth">[];
}

async function processFamilyCsv(req: ProcessFamilyCsvRequest) {
  await httpsCallable(functions, "processFamilyCsv")(JSON.stringify(req));
}

export default function useProcessFamilyCsv() {
  return useMutation({
    mutationFn: (req: ProcessFamilyCsvRequest) => processFamilyCsv(req)
  })
}