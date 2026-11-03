import { useMutation } from "@tanstack/react-query";
import { parse, Info } from "csv-parse/sync";
import { ParsedCamperCsvData } from "./types";
import { z } from "zod";

interface ParseCamperCsvRequest {
  csvFile: File;
}

type RawCamperCsvRecord = {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
}

type RawCamperCsvRecordWithInfo = {
  record: RawCamperCsvRecord;
  info: Info;
};

const ParsedCamperCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
})
type ParsedCamperCsvRecord = z.infer<typeof ParsedCamperCsvRecordSchema>;

function parseCamperRecords(data: RawCamperCsvRecordWithInfo[]): ParsedCamperCsvData {
  const campers: ParsedCamperCsvData["campers"] = [];
  data.forEach(({ record, info }) => {
    const validationResult = ParsedCamperCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      throw Error(`Invalid record on line ${info.lines}. Please fix before uploading.`);
    }

    const parsedRecord: ParsedCamperCsvRecord = validationResult.data;
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

export async function parseCamperCsv(req: ParseCamperCsvRequest): Promise<ParsedCamperCsvData> {
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
  }) as RawCamperCsvRecordWithInfo[];
  return parseCamperRecords(data);
}

export default function useParseCamperCsv() {
  return useMutation({
    mutationFn: (req: ParseCamperCsvRequest) => parseCamperCsv(req)
  })
}