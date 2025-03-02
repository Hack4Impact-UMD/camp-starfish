"use client";

import { redirect } from "next/navigation";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="flex items-center justify-center w-full h-full flex-col bg-white">
      <h1
        className="text-black text-6xl font-newSpirit font-semibold mb-4"
      >
        {error.name}
      </h1>
      <p
        className="text-black mb-16 text-center max-w-4xl font-lato"
      >
        {error.message}
      </p>
      <button
        className="bg-camp-tert-green px-24 py-3 font-lato font-bold rounded-full text-white"
        onClick={() => redirect("/")}
      >
        GO BACK
      </button>
    </div>
  );
}
