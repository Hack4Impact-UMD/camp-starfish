import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Camper } from "@/types/users/userTypes";

export interface ProcessCamperCsvRequest {
  campers: Pick<Camper, "id" | "name" | "gender" | "dateOfBirth">[];
}

async function processCamperCsv(req: ProcessCamperCsvRequest) {
  await httpsCallable(functions, "processCamperCsv")(JSON.stringify(req));
}

export default function useProcessCamperCsv() {
  return useMutation({
    mutationFn: (req: ProcessCamperCsvRequest) => processCamperCsv(req)
  })
}