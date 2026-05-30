import { Camper, Parent } from "@/types/users/userTypes";
import { parse } from "csv-parse/sync";
import { createCamper, getCamperById, updateCamper } from "../firestore/campers";
import { createParent, getParentById, updateParent } from "../firestore/parents";
import { parseAppSegmentConfig } from "next/dist/build/segment-config/app/app-segment-config";

type CamperCSVRecord = {
  "First Name": string;
  "Last Name": string;
  PersonID: string;
  "F1P1 First Name": string;
  "F1P1 Last Name": string;
  "F1P1 Person ID": string;
  "F1P1 Login/Email": string;
  "F1P2 First Name": string;
  "F1P2 Last Name": string;
  "F1P2 Person ID": string;
  "F1P2 Login/Email": string;
};

interface ParseFamilyCSVResponse {
  campers: { [camperId: number]: Pick<Camper, "id" | "name" | "parentIds">; };
  parents: { [parentId: number]: Pick<Parent, "id" | "name" | "email" | "camperIds">; };
}

function parseCamperRecords(records: CamperCSVRecord[]): ParseFamilyCSVResponse {
  const campers: ParseFamilyCSVResponse["campers"] = [];
  const parents: ParseFamilyCSVResponse["parents"] = [];

  records.forEach((record) => {
    const camperId: number = parseInt(record.PersonID);
    const parent1Id: number = parseInt(record["F1P1 Person ID"]);
    const parent2Id: number = parseInt(record["F1P2 Person ID"]);

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

    if (!Number.isNaN(parent2Id)) {
      if (parents[parent2Id]) {
        parents[parent2Id].camperIds.push(camperId);
      } else {
        parents[parent2Id] = {
          id: parseInt(record["F1P2 Person ID"]),
          name: {
            firstName: record["F1P2 First Name"],
            lastName: record["F1P2 Last Name"]
          },
          email: record["F1P2 Login/Email"],
          camperIds: [camperId],
        }
      }
    }

    if (record["F1P2 First Name"]) {
      parents.push({
        id: parseInt(record["F1P2 Person ID"]),
        name: {
          firstName: record["F1P2 First Name"],
          lastName: record["F1P2 Last Name"]
        }, email: record["F1P2 Login/Email"],
        camperIds: [parseInt(record.PersonID)],
      })
    }
  });
  return { campers, parents };
}

export async function parseCampersCSV(file: File) {
  let rawText = await file.text();

  let records = parse(rawText, {
    columns: true,
  }) as CamperCSVRecord[];

  const { campers, parents } = parseCamperRecords(records);

  let campersPromises =
    await Promise.all(campers.map(async (camper) => {
      try {
        await updateCamper(camper.campminderId, camper)
      } catch (e: any) {
        await createCamper(camper);
      }
    }))

  await Promise.all(parents.map(async (parent) => {
    try {
      await updateParent(parent.campminderId, parent)
    } catch (e: any) {
      await createParent(parent);
    }
  }))

  console.log(parents, campers)

}
