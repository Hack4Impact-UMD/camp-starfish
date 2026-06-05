import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { UnregisteredEmployee } from "@/types/users/userTypes";

interface ProcessEmployeeCSVRequest {
  parsedEmployeeCsvData: UnregisteredEmployee[];
}

async function processEmployeeCSV(req: ProcessEmployeeCSVRequest) {
  const { parsedEmployeeCsvData } = req;
  await httpsCallable(functions, "handleEmployeeCSVUpload")(parsedEmployeeCsvData);
}

export default function useProcessEmployeeCSV() {
  return useMutation({
    mutationFn: (req: ProcessEmployeeCSVRequest) => processEmployeeCSV(req)
  })
}