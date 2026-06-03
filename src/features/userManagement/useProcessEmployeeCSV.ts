import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { parseEmployeeCSV } from "./parseEmployeeCSV";

interface ProcessEmployeeCSVRequest {
  csvFile: File;
}

async function processEmployeeCSV(req: ProcessEmployeeCSVRequest) {
  const { csvFile } = req;
  const parsedData = await parseEmployeeCSV(csvFile);
  await httpsCallable(functions, "handleEmployeeCSVUpload")(parsedData);
}

export default function useProcessEmployeeCSV() {
  return useMutation({
    mutationFn: (req: ProcessEmployeeCSVRequest) => processEmployeeCSV(req)
  })
}