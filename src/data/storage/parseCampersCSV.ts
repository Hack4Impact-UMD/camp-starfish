import { Camper, Parent } from "@/types/personTypes";
import { parse } from "csv-parse/sync";



export async function parseCampersCSV(file: File) {
    let rawText = await file.text();

    let records = parse(rawText, {
        columns: true,
    });
    
    let campers: Partial<Camper>[] = [];
    let parents: Partial<Parent>[] = [];

    records.forEach(record => {
        
        let name = {
            firstName: record["First Name"],
            lastName: record["Last Name"]
        };

        let campminderId = record["PersonID"];


    });

}