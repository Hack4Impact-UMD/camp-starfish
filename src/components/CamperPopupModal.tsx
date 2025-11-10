"use client";

import React from "react";
import Image from "next/image";
import avatarIcon from "@/assets/icons/avatarIcon.png";
import crossIcon from "@/assets/icons/crossIcon.svg";

type CamperDetails = {
    name: string;
    bunk: string;
    navStatus: "NAV" | "OCP" | string;
    swimLevel: string;
    emergencyMedication?: string;
    conflicts: string[];
}

type CamperModalProps = {
    camper: CamperDetails;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
};

export default function CamperModal({
    camper,
    isOpen,
    onClose,
    onEdit,
}: CamperModalProps) {
    if (!isOpen) return null;

    const {
        name,
        bunk,
        navStatus,
        swimLevel,
        emergencyMedication,
        conflicts,
    } = camper;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-camp-text-headingBody shadow-lg">
            <button
              onClick={onClose}
              className="absolute left-4 top-4 transition hover:opacity-70"
              aria-label="Close camper details"
            >
              <Image src={crossIcon} alt="Close modal" width={20} height={20} />
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                className="absolute right-4 top-4 rounded-md border border-camp-primary px-3 py-1 text-sm font-medium text-camp-primary transition hover:bg-camp-primary hover:text-white"
              >
                Edit
              </button>
            )}

            <header className="flex flex-col items-center justify-center gap-3 pt-6">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-camp-background-modal ring-2 ring-camp-primary/80">
                <Image src={avatarIcon} alt="Camper avatar" fill />
              </div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-sm text-camp-text-subheading">
                {bunk} · {navStatus}
              </p>
            </header>

            <section className="mt-6 space-y-3 text-sm leading-relaxed">
              <div>
                <span className="font-semibold text-camp-text-headingBody">Swim Level:</span>{" "}
                <span>{swimLevel}</span>
              </div>
    
              <div>
                <span className="font-semibold text-camp-text-headingBody">
                  Emergency Medication:
                </span>{" "}
                <span>{emergencyMedication?.trim() || "None reported"}</span>
              </div>
    
              <div>
                <span className="font-semibold text-camp-text-headingBody">Conflicts:</span>
                {conflicts.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {conflicts.map((conflictName) => (
                      <li
                        key={conflictName}
                        className="rounded-full bg-camp-background-modal px-3 py-1 text-xs font-medium text-camp-text-headingBody"
                      >
                        {conflictName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-camp-text-subheading">
                    No conflicts on file.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      );
}