import { useMutation } from "@tanstack/react-query";
import { Info, parse } from "csv-parse/sync";
import { ParsedCounselorCsvData } from "./types";
import { z } from "zod";

interface ParseCounselorCsvRequest {
  csvFile: File;
}

interface RawCounselorCsvRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "Login/Email": string;
}

interface RawCounselorCsvRecordWithInfo {
  record: RawCounselorCsvRecord;
  info: Info;
}

const CounselorCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  "Login/Email": z.string().email(),
})
type ParsedCounselorCsvRecord = z.infer<typeof CounselorCsvRecordSchema>;

const REQUIRED_COLUMNS = [
  "First Name",
  "Last Name",
  "PersonID",
  "Login/Email"
]

export async function parseCounselorCsv(req: ParseCounselorCsvRequest): Promise<ParsedCounselorCsvData> {
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
  }) as RawCounselorCsvRecordWithInfo[];
  return data.map(({ record, info }) => {
    const validationResult = CounselorCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      throw Error(`Invalid record on line ${info.lines}. Please fix before uploading.`);
    }
    const parsedRecord: ParsedCounselorCsvRecord = validationResult.data;
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

export default function useParseCounselorCsv() {
  return useMutation({
    mutationFn: (req: ParseCounselorCsvRequest) => parseCounselorCsv(req)
  })
}