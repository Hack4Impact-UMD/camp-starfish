import { useMutation } from "@tanstack/react-query";
import { parse, Info } from "csv-parse/sync";
import { ParsedFamilyCsvData } from "./types";
import { z } from "zod";

interface ParseFamilyCsvRequest {
  csvFile: File;
}

type RawFamilyCsvRecord = {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
}

type RawFamilyCsvRecordWithInfo = {
  record: RawFamilyCsvRecord;
  info: Info;
};

const ParsedFamilyCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
})
type ParsedFamilyCsvRecord = z.infer<typeof ParsedFamilyCsvRecordSchema>;

function parseFamilyRecords(data: RawFamilyCsvRecordWithInfo[]): ParsedFamilyCsvData {
  const campers: ParsedFamilyCsvData["campers"] = [];
  data.forEach(({ record, info }) => {
    const validationResult = ParsedFamilyCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      throw Error(`Invalid record on line ${info.lines}. Please fix before uploading.`);
    }

    const parsedRecord: ParsedFamilyCsvRecord = validationResult.data;
    const camperId = parsedRecord.PersonID;
    campers.push({
      id: camperId,
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      }
    });
  });
  return { campers };
}

const REQUIRED_COLUMNS = [
  "First Name",
  "Last Name",
  "PersonID",
]

export async function parseFamilyCsv(req: ParseFamilyCsvRequest): Promise<ParsedFamilyCsvData> {
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
  }) as RawFamilyCsvRecordWithInfo[];
  return parseFamilyRecords(data);
}

export default function useParseFamilyCsv() {
  return useMutation({
    mutationFn: (req: ParseFamilyCsvRequest) => parseFamilyCsv(req)
  })
}