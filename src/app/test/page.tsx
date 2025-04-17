
import { getImage, createImage, updateImage, deleteImage } from "@/data/firestore/images";
// import { useRef, useState } from "react";

export default async function Page() {
    // change fire store rules to allow read/write for testing
    
    // await createImage("albumId", {
    //     name: "Test Image", 
    //     dateTaken: new Date().toDateString(),
    //     tags: "ALL",
    //     inReview: false,
    // });
    // const image = await getImage("albumId", "NR9icP0dqCj4HPYP0KW9");
    // await updateImage("albumId", "NR9icP0dqCj4HPYP0KW9", { name: "Updated Image", inReview: true });
    await deleteImage("albumId", "rCHd9MDbboPli1qCF6mG");

  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
        <h1 className="color: bg-black">Hello</h1>
        </div>
      </div>
    </div>
  );
}
