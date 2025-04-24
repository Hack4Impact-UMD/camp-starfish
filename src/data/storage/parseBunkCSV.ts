import { parse } from "csv-parse/sync";
import { CamperSessionAttendee } from "@/types/sessionTypes";
import { createCamper, updateCamper } from "../firestore/campers";

// CSV row structure
type BunkCSVRecord = {
  "First Name": string;
  "Last Name": string;
  campminderId: string; // now matching your CSV column
  "2025Session1Bunk": string;
};

// Allow bunk to be a string
type PartialBunkAttendee = Partial<Omit<CamperSessionAttendee, "bunk">> & {
  bunk: string;
};

// Convert each row into a partial camper session attendee
async function parseBunkRecords(records: BunkCSVRecord[]): Promise<PartialBunkAttendee[]> {
  const campers: PartialBunkAttendee[] = [];

  records.forEach((record) => {
    campers.push({
      campminderId: parseInt(record.campminderId),
      name: {
        firstName: record["First Name"],
        lastName: record["Last Name"],
      },
      bunk: record["2025Session1Bunk"], // keep as string
    });
  });

  return campers;
}

// Main parser + Firestore sync
export async function parseBunkCSV(file: File): Promise<void> {
  const rawText = await file.text();

  const records = parse(rawText, {
    columns: true,
    skip_empty_lines: true,
  }) as BunkCSVRecord[];

  const campers = await parseBunkRecords(records);

  await Promise.all(
    campers.map(async (camper) => {
      if (!camper.campminderId) return;

      try {
        await updateCamper(camper.campminderId, camper);
      } catch (e: any) {
        await createCamper(camper as any); // ensure compatibility with full Camper type
      }
    })
  );

  console.log("Synced bunk campers:", campers);
}
