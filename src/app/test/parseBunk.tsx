"use client";

import { parseBunkCSV } from "@/data/storage/parseBunkCSV";
import { useRef } from "react";

export default function TestPage() {
  let fileInpRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        type="file"
        name="Enter bunk CSV"
        ref={fileInpRef}
        className="p-4"
      />
      <button
        className="block m-2 p-2 bg-blue-500 rounded-md text-white"
        onClick={async () => {
          if(fileInpRef.current?.files && fileInpRef.current.files.length) {
            await parseBunkCSV(fileInpRef.current.files[0])
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