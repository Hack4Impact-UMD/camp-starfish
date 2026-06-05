import { useMutation } from "@tanstack/react-query";
import { parse, Info } from "csv-parse/sync";
import { ParsedFamilyCsvData } from "./types";
import { z } from "zod";

interface ParseFamilyCsvRequest {
  csvFile: File;
}

interface BaseFamilyCSVRecord {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "F1P1 First Name": string;
  "F1P1 Last Name": string;
  "F1P1 Person ID": string;
  "F1P1 Login/Email": string;
}

interface FamilyCsvRecordOneParent extends BaseFamilyCSVRecord {
  "F1P2 First Name": "";
  "F1P2 Last Name": "";
  "F1P2 Person ID": "";
  "F1P2 Login/Email": "";
}

interface FamilyCsvRecordTwoParents extends BaseFamilyCSVRecord {
  "F1P2 First Name": string;
  "F1P2 Last Name": string;
  "F1P2 Person ID": string;
  "F1P2 Login/Email": string;
}

type FamilyCSVRecord = FamilyCsvRecordOneParent | FamilyCsvRecordTwoParents;

type FamilyCsvRecordWithInfo = {
  record: FamilyCSVRecord;
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

function parseFamilyRecords(data: FamilyCsvRecordWithInfo[]): ParsedFamilyCsvData {
  const campers: ParsedFamilyCsvData["campers"] = {};
  const parents: ParsedFamilyCsvData["parents"] = {};

  data.forEach(({ record, info }) => {
    const validationResult = ParsedFamilyCsvRecordSchema.safeParse(record);
    if (!validationResult.success) {
      throw Error(`Invalid record on line ${info.lines}. Please fix before uploading.`);
    }

    const parsedRecord: ParsedFamilyCsvRecord = validationResult.data;
    const camperId = parsedRecord.PersonID;
    const parent1Id = parsedRecord["F1P1 Person ID"];
    const parent2Id = parsedRecord["F1P2 Person ID"];
    campers[camperId] = {
      id: camperId,
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      },
      parentIds: parent2Id === undefined
        ? [parent1Id]
        : [parent1Id, parent2Id],
    };

    if (parents[parent1Id]) {
      parents[parent1Id].camperIds.push(camperId);
    } else {
      parents[parent1Id] = {
        id: parseInt(record["F1P1 Person ID"]),
        name: {
          firstName: record["F1P1 First Name"],
          lastName: record["F1P1 Last Name"]
        },
        email: record["F1P1 Login/Email"],
        camperIds: [camperId],
      }
    }

    if (parent2Id) {
      if (parents[parent2Id]) {
        parents[parent2Id].camperIds.push(camperId);
      } else {
        parents[parent2Id] = {
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
  return { campers, parents };
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
    columns: (cols: string[]) => {
      const missingColumns = REQUIRED_COLUMNS.filter(col => !cols.includes(col));
      if (missingColumns.length > 0) {
        throw Error("Missing columns: " + missingColumns.join(", "));
      }
      return cols;
    },
    info: true,
    skip_empty_lines: true
  }) as FamilyCsvRecordWithInfo[];
  return parseFamilyRecords(data);
}

export default function useParseFamilyCsv() {
  return useMutation({
    mutationFn: (req: ParseFamilyCsvRequest) => parseFamilyCsv(req)
  })
}