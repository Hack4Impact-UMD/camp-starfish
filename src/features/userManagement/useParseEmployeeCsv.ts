import { useMutation } from "@tanstack/react-query";
import { Info, parse } from "csv-parse/sync";
import { ParsedEmployeeCsvData } from "./types";
import { z } from "zod";

interface ParseEmployeeCsvRequest {
  csvFile: File;
}

interface RawEmployeeCsvRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "Login/Email": string;
}

interface RawEmployeeCsvRecordWithInfo {
  record: RawEmployeeCsvRecord;
  info: Info;
}

const EmployeeCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  "Login/Email": z.string().email(),
})
type ParsedEmployeeCsvRecord = z.infer<typeof EmployeeCsvRecordSchema>;

const REQUIRED_COLUMNS = [
  "First Name",
  "Last Name",
  "PersonID",
  "Login/Email"
]

export async function parseEmployeeCsv(req: ParseEmployeeCsvRequest): Promise<ParsedEmployeeCsvData> {
  const { csvFile } = req;
  const rawText = await csvFile.text();
  const data = parse(rawText, {
    columns: (cols: string[]) => {
      const missingColumns = REQUIRED_COLUMNS.filter(col => !cols.includes(col));
      if (missingColumns.length > 0) {
        throw Error("Missing columns: " + missingColumns.join(", "));
      }
      return cols;
    },
    info: true,
    skip_empty_lines: true
  }) as RawEmployeeCsvRecordWithInfo[];
  return data.map(({ record, info }) => {
    const validationResult = EmployeeCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      throw Error(`Invalid record on line ${info.lines}. Please fix before uploading.`);
    }
    const parsedRecord: ParsedEmployeeCsvRecord = validationResult.data;
    return {
      id: parsedRecord.PersonID,
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"]
      },
      email: record["Login/Email"]
    }
  });
}

export default function useParseEmployeeCsv() {
  return useMutation({
    mutationFn: (req: ParseEmployeeCsvRequest) => parseEmployeeCsv(req)
  })
}