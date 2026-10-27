import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Counselor } from "@/types/users/userTypes";

export interface ProcessEmployeeCsvRequest {
  employees: Pick<Counselor, "id" | "name" | "email" | "role" | "gender" | "dateOfBirth">[];
}

async function processEmployeeCsv(req: ProcessEmployeeCsvRequest) {
  await httpsCallable(functions, "processEmployeeCsv")(JSON.stringify(req));
}

export default function useProcessEmployeeCsv() {
  return useMutation({
    mutationFn: (req: ProcessEmployeeCsvRequest) => processEmployeeCsv(req)
  })
}