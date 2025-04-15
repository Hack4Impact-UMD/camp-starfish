import { Camper, Parent } from "@/types/personTypes";
import { parse } from "csv-parse/sync";
import { createCamper, getCamperById, updateCamper } from "../firestore/campers";
import { createParent, getParentById, updateParent } from "../firestore/parents";

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

async function parseCamperRecords(records: CamperCSVRecord[]): Promise<[Camper[], Parent[]]> {

  let campers: Camper[] = [];
  let parents: Parent[] = [];

  records.forEach((record) => {    
    campers.push({
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      },
      campminderId: parseInt(record.PersonID),
      nonoList: [],
      parentIds: record["F1P2 First Name"]
        ? [parseInt(record["F1P1 Person ID"]), parseInt(record["F1P2 Person ID"])]
        : [parseInt(record["F1P1 Person ID"])],
    });

    parents.push({
        campminderId: parseInt(record["F1P1 Person ID"]),
        name: {
            firstName: record["F1P1 First Name"],
            lastName: record["F1P1 Last Name"]
        },
        role: "PARENT",
        email: record["F1P1 Login/Email"],
        camperIds: [parseInt(record.PersonID)],
    })

    if(record["F1P2 First Name"]) {
        parents.push({
            campminderId: parseInt(record["F1P2 Person ID"]),
            name: {
                firstName: record["F1P2 First Name"],
                lastName: record["F1P2 Last Name"]
            },
            role: "PARENT",
            email: record["F1P2 Login/Email"],
            camperIds: [parseInt(record.PersonID)],
        })
    }

    

  })
  return [campers, parents];
}

export async function parseCampersCSV(file: File) {
  let rawText = await file.text();

  let records = parse(rawText, {
    columns: true,
  }) as CamperCSVRecord[];

  let [campers, parents] = await parseCamperRecords(records);

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
