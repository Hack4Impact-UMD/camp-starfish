import { useMutation } from "@tanstack/react-query";
import { Info, parse } from "csv-parse/sync";
import { requireCsvColumns } from "./csvUtils";
import { ParsedEmployeeCsvData } from "./types";
import { z } from "zod";

interface ParseEmployeeCsvRequest {
  csvFile: File;
}

interface RawEmployeeCSVRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "Login/Email": string;
}

interface RawEmployeeCsvRecordWithInfo {
  record: RawEmployeeCSVRecord;
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
    columns: requireCsvColumns(REQUIRED_COLUMNS),
    info: true,
    skip_empty_lines: true
  }) as RawEmployeeCsvRecordWithInfo[];
  const employees: ParsedEmployeeCsvData = [];
  const invalidLines: number[] = [];
  data.forEach(({ record, info }) => {
    const validationResult = EmployeeCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      invalidLines.push(info.lines);
      return;
    }
    const parsedRecord: ParsedEmployeeCsvRecord = validationResult.data;
    employees.push({
      id: parsedRecord.PersonID,
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"]
      },
      email: record["Login/Email"]
    });
  });
  if (invalidLines.length > 0) {
    throw Error(`Invalid record(s) on line(s) ${invalidLines.join(", ")}. Please fix before uploading.`);
  }
  return employees;
}

export default function useParseEmployeeCsv() {
  return useMutation({
    mutationFn: (req: ParseEmployeeCsvRequest) => parseEmployeeCsv(req)
  })
}