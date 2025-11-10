"use client";

import { useState } from "react";
import CamperModal from "@/components/CamperPopupModal";

const exampleCamper = {
  name: "Sam Smith",
  bunk: "Bunk 7",
  navStatus: "OCP" as const,
  swimLevel: "Level 3",
  emergencyMedication: "Inhaler",
  conflicts: ["Anna G.", "Taylor M."],
};

export default function TestCamperModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 p-8">
      <h1 className="text-2xl font-semibold text-camp-text-headingBody">
        Camper Modal Demo
      </h1>
      <p className="text-sm text-camp-text-subheading">
        Click the button below to open the camper modal.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-camp-primary px-4 py-2 text-white shadow transition hover:bg-camp-primary/90"
      >
        Open Camper Modal
      </button>
      <CamperModal
        camper={exampleCamper}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </main>
  );
}

