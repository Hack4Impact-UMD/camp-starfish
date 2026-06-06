import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { Employee } from "@/types/users/userTypes";

interface ProcessEmployeeCSVRequest {
  employees: Pick<Employee, "id" | "name" | "email" | "role" | "gender" | "dateOfBirth">[];
}

async function processEmployeeCSV(req: ProcessEmployeeCSVRequest) {
  await httpsCallable(functions, "handleEmployeeCSVUpload")(req);
}

export default function useProcessEmployeeCSV() {
  return useMutation({
    mutationFn: (req: ProcessEmployeeCSVRequest) => processEmployeeCSV(req)
  })
}