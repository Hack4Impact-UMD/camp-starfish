import { httpsCallable } from "firebase/functions";
import { parseFamilyCSV } from "./parseFamilyCSV";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";

interface ProcessFamilyCSVRequest {
  csvFile: File;
}

async function processFamilyCSV(req: ProcessFamilyCSVRequest) {
  const { csvFile } = req;
  const parsedData = await parseFamilyCSV(csvFile);
  await httpsCallable(functions, "handleFamilyCSVUpload")(parsedData);
}

export default function useProcessFamilyCSV() {
  return useMutation({
    mutationFn: (req: ProcessFamilyCSVRequest) => processFamilyCSV(req)
  })
}