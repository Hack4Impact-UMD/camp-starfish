import { useMutation } from "@tanstack/react-query";
import { parse } from "csv-parse/sync";
import { ParsedEmployeeCsvData } from "./types";

interface ParseEmployeeCsvRequest {
  csvFile: File;
}

interface EmployeeCSVRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "Login/Email": string;
}

const REQUIRED_COLUMNS = [
  "First Name",
  "Last Name",
  "PersonID",
  "Login/Email"
]

export async function parseEmployeeCsv(req: ParseEmployeeCsvRequest): Promise<ParsedEmployeeCsvData> {
  const { csvFile } = req;
  const rawText = await csvFile.text();
  const records = parse(rawText, {
    columns: (cols: string[]) => {
      const missingColumns = REQUIRED_COLUMNS.filter(col => !cols.includes(col));
      if (missingColumns.length > 0) {
        throw Error("Missing columns: " + missingColumns.join(", "));
      }
      return cols;
    },
    skip_empty_lines: true
  }) as EmployeeCSVRecord[];
  return records.filter(record => !Number.isNaN(parseInt(record.PersonID))).map(record => ({
    id: parseInt(record.PersonID),
    name: {
      firstName: record["First Name"],
      lastName: record["Last Name"]
    },
    email: record["Login/Email"]
  }));
}

export default function useParseEmployeeCsv() {
  return useMutation({
    mutationFn: (req: ParseEmployeeCsvRequest) => parseEmployeeCsv(req)
  })
}