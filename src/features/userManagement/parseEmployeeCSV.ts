import { Camper, Parent, UnregisteredEmployee } from "@/types/users/userTypes";
import { parse } from "csv-parse/sync";

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

export async function parseEmployeeCSV(file: File): Promise<UnregisteredEmployee[]> {
  const rawText = await file.text();
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
