import { parse } from "csv-parse/sync";
import { CamperSessionAttendee } from "@/types/sessionTypes";

export async function parseBunkCSV(file: File): Promise<Partial<CamperSessionAttendee>[]> {
    const rawText = await file.text();

    const records = parse(rawText, {
        columns: true,
        skip_empty_lines: true,
    });

    const campers: Partial<CamperSessionAttendee>[] = [];

    records.forEach(record => {
        const camper: Partial<CamperSessionAttendee> = {
            name: {
                firstName: record["First Name"],
                lastName: record["Last Name"],
            },
            bunk: parseInt(record["2025Session1Bunk"]),
        };

        campers.push(camper);
    });

    return campers;
}
