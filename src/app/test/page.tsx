"use client";

import { parseCampersCSV } from "@/data/storage/parseCampersCSV";
import { useRef } from "react";

export default function TestPage() {
  let fileInpRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        type="file"
        name="Enter camper CSV"
        ref={fileInpRef}
        className="p-4"
      />
      <button
        className="block m-2 p-2 bg-blue-500 rounded-md text-white"
        onClick={async () => {
          if(fileInpRef.current?.files && fileInpRef.current.files.length) {
            await parseCampersCSV(fileInpRef.current.files[0])
          } else {
            console.log("no file")
          }
        }}
      >
        Parse and Upload
      </button>
    </>
  );
}
