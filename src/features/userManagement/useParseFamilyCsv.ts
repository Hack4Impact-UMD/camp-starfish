import { useMutation } from "@tanstack/react-query";
import { parse, Info } from "csv-parse/sync";
import { requireCsvColumns } from "./csvUtils";
import { ParsedFamilyCsvData } from "./types";
import { z } from "zod";

interface ParseFamilyCsvRequest {
  csvFile: File;
}

interface BaseRawFamilyCsvRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "F1P1 First Name": string;
  "F1P1 Last Name": string;
  "F1P1 Person ID": string;
  "F1P1 Login/Email": string;
}

interface RawFamilyCsvRecordOneParent extends BaseRawFamilyCsvRecord {
  "F1P2 First Name": "";
  "F1P2 Last Name": "";
  "F1P2 Person ID": "";
  "F1P2 Login/Email": "";
}

interface RawFamilyCsvRecordTwoParents extends BaseRawFamilyCsvRecord {
  "F1P2 First Name": string;
  "F1P2 Last Name": string;
  "F1P2 Person ID": string;
  "F1P2 Login/Email": string;
}

type RawFamilyCsvRecord = RawFamilyCsvRecordOneParent | RawFamilyCsvRecordTwoParents;

type RawFamilyCsvRecordWithInfo = {
  record: RawFamilyCsvRecord;
  info: Info;
};

const BaseFamilyCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  "F1P1 First Name": z.string().min(1),
  "F1P1 Last Name": z.string().min(1),
  "F1P1 Person ID": z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  "F1P1 Login/Email": z.string().email(),
})

const FamilyCsvRecordOneParentSchema = z.object({
  "F1P2 First Name": z.string().max(0).transform(() => undefined),
  "F1P2 Last Name": z.string().max(0).transform(() => undefined),
  "F1P2 Person ID": z.string().max(0).transform(() => undefined),
  "F1P2 Login/Email": z.string().max(0).transform(() => undefined),
});

const FamilyCsvRecordTwoParentsSchema = z.object({
  "F1P2 First Name": z.string().min(1),
  "F1P2 Last Name": z.string().min(1),
  "F1P2 Person ID": z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  "F1P2 Login/Email": z.string().email(),
})

const ParsedFamilyCsvRecordSchema = BaseFamilyCsvRecordSchema.and(FamilyCsvRecordOneParentSchema.or(FamilyCsvRecordTwoParentsSchema));
type ParsedFamilyCsvRecord = z.infer<typeof ParsedFamilyCsvRecordSchema>;

function parseFamilyRecords(data: RawFamilyCsvRecordWithInfo[]): ParsedFamilyCsvData {
  const campersById: { [camperId: number]: ParsedFamilyCsvData["campers"][number]; } = {};
  const parentsById: { [parentId: number]: ParsedFamilyCsvData["parents"][number]; } = {};
  const invalidLines: number[] = [];

  data.forEach(({ record, info }) => {
    const validationResult = ParsedFamilyCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      invalidLines.push(info.lines);
      return;
    }

    const parsedRecord: ParsedFamilyCsvRecord = validationResult.data;
    const camperId = parsedRecord.PersonID;
    const parent1Id = parsedRecord["F1P1 Person ID"];
    const parent2Id = parsedRecord["F1P2 Person ID"];
    campersById[camperId] = {
      id: camperId,
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      },
      parentIds: parent2Id === undefined
        ? [parent1Id]
        : [parent1Id, parent2Id],
    };

    if (parentsById[parent1Id]) {
      parentsById[parent1Id].camperIds.push(camperId);
    } else {
      parentsById[parent1Id] = {
        id: parseInt(record["F1P1 Person ID"]),
        name: {
          firstName: record["F1P1 First Name"],
          lastName: record["F1P1 Last Name"]
        },
        email: record["F1P1 Login/Email"],
        camperIds: [camperId],
      }
    }

    if (parent2Id !== undefined) {
      if (parentsById[parent2Id]) {
        parentsById[parent2Id].camperIds.push(camperId);
      } else {
        parentsById[parent2Id] = {
          id: parent2Id,
          name: {
            firstName: record["F1P2 First Name"],
            lastName: record["F1P2 Last Name"]
          },
          email: record["F1P2 Login/Email"],
          camperIds: [camperId],
        }
      }
    }
  });
  if (invalidLines.length > 0) {
    throw Error(`Invalid record(s) on line(s) ${invalidLines.join(", ")}. Please fix before uploading.`);
  }
  return {
    campers: Object.values(campersById),
    parents: Object.values(parentsById)
  };
}

const REQUIRED_COLUMNS = [
  "First Name",
  "Last Name",
  "PersonID",
  "F1P1 First Name",
  "F1P1 Last Name",
  "F1P1 Person ID",
  "F1P1 Login/Email"
]

export async function parseFamilyCsv(req: ParseFamilyCsvRequest): Promise<ParsedFamilyCsvData> {
  const { csvFile } = req;
  const rawText = await csvFile.text();
  const data = parse(rawText, {
    columns: requireCsvColumns(REQUIRED_COLUMNS),
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