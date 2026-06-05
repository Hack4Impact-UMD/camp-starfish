import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { ParsedFamilyCsvData } from "./types";

interface ProcessFamilyCSVRequest {
  parsedFamilyCsvData: ParsedFamilyCsvData;
}

async function processFamilyCSV(req: ProcessFamilyCSVRequest) {
  const { parsedFamilyCsvData } = req;
  await httpsCallable(functions, "handleFamilyCSVUpload")(parsedFamilyCsvData);
}

export default function useProcessFamilyCSV() {
  return useMutation({
    mutationFn: (req: ProcessFamilyCSVRequest) => processFamilyCSV(req)
  })
}