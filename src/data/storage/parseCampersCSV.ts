import { parse } from "csv-parse/sync";



export async function parseCampersCSV(file: File) {
    let rawText = await file.text();

    let records = parse(rawText, {
        columns: true,
    })
    console.log(records);

}