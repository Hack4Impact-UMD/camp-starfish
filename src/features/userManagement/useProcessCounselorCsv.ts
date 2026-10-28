import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Counselor } from "@/types/users/userTypes";

export interface ProcessCounselorCsvRequest {
  counselors: Pick<Counselor, "id" | "name" | "email" | "role" | "gender" | "dateOfBirth">[];
}

async function processCounselorCsv(req: ProcessCounselorCsvRequest) {
  await httpsCallable(functions, "processCounselorCsv")(JSON.stringify(req));
}

export default function useProcessCounselorCsv() {
  return useMutation({
    mutationFn: (req: ProcessCounselorCsvRequest) => processCounselorCsv(req)
  })
}