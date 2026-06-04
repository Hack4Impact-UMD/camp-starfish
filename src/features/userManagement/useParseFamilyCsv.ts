import { useMutation } from "@tanstack/react-query";
import { Camper, Parent } from "@/types/users/userTypes";
import { parse } from "csv-parse/sync";

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

type FamilyCSVRecord = BaseFamilyCSVRecord | BaseFamilyCSVRecord & {
  "F1P2 First Name": string;
  "F1P2 Last Name": string;
  "F1P2 Person ID": string;
  "F1P2 Login/Email": string;
};

export interface ParseFamilyCSVResponse {
  campers: { [camperId: number]: Pick<Camper, "id" | "name" | "parentIds">; };
  parents: { [parentId: number]: Pick<Parent, "id" | "name" | "email" | "camperIds">; };
}

function parseFamilyRecords(records: FamilyCSVRecord[]): ParseFamilyCSVResponse {
  const campers: ParseFamilyCSVResponse["campers"] = {};
  const parents: ParseFamilyCSVResponse["parents"] = {};

  records.forEach((record) => {
    const camperId: number = parseInt(record.PersonID);
    const parent1Id: number = parseInt(record["F1P1 Person ID"]);
    const parent2Id: number = "F1P2 Person ID" in record ? parseInt(record["F1P2 Person ID"]) : NaN;

    if (Number.isNaN(camperId) || Number.isNaN(parent1Id)) return;

    campers[camperId] = {
      id: parseInt(record.PersonID),
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      },
      parentIds: Number.isNaN(parent2Id)
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

    if ("F1P2 Person ID" in record && !Number.isNaN(parent2Id)) {
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

export async function parseFamilyCsv(req: ParseFamilyCsvRequest): Promise<ParseFamilyCSVResponse> {
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
  }) as FamilyCSVRecord[];
  return parseFamilyRecords(records);
}

export default function useParseFamilyCsv() {
  return useMutation({
    mutationFn: (req: ParseFamilyCsvRequest) => parseFamilyCsv(req)
  })
}