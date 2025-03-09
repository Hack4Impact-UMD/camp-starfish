"use client"

import { uploadImages } from "@/firebase/fileStorage";
import { useRef, useState } from "react";

export default function FileTest() {

    const filePathInputUpload = useRef<HTMLInputElement | null>(null);
    const filePathInputDownload = useRef<HTMLInputElement | null>(null);
    const fileInput = useRef<HTMLInputElement | null>(null);

    let [uploadedList, setUploadedList] = useState<string[]>([]);

    return (
        <div className="p-4">
            <h1 className="text-2xl">Upload Files</h1>
            <input className="block border my-2" type="text" ref={filePathInputUpload} placeholder="Enter file upload paths"/>
            <p>^ comma separate for uploading multiple files (ensure one file upload path for every file selected)</p>
            <input className="block border my-2" multiple type="file" ref={fileInput}/>
            <input className="block bg-blue-500 hover:bg-blue-700 text-white p-2 rounded" type="button" value="Upload" 
                onClick={async () => {
                    if(fileInput.current && filePathInputUpload.current && fileInput) {
                        let paths = filePathInputUpload.current.value.split(",").map(x => x.trim()).filter(x => x);
                        let files = (fileInput.current.files) ? Array.from(fileInput.current.files) : [];

                        if (paths.length != files?.length) {
                            alert(`Paths and files dont match. ${paths.length} paths found and ${files?.length} files`);
                        } else {
                            await uploadImages(files, paths);
                            setUploadedList(paths.map((x, i) => `${files[i].name} → ${x}`))
                        }
                    }
                }}/>
            
            {(uploadedList.length > 0) ? <p className="mt-4">Files Uploaded: </p> : null}
            <ul>{uploadedList.map(x => <li className="" key={x}>{x}</li>)}</ul>

            <h1 className="text-2xl mt-5">Download Files</h1>
            <input className="block border my-2" type="text" ref={filePathInputDownload} placeholder="Enter file download path"/>
            <p>^ comma separate for downloading multiple files</p>
            <input className="block bg-blue-500 hover:bg-blue-700 text-white p-2 rounded" type="button" value="Download"/>
        </div>
    );

}