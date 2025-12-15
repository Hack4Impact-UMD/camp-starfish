"use client";

import React, { useState, useEffect } from "react";
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedCamper, setEditedCamper] = useState(camper);

    // Update edited camper when camper prop changes
    useEffect(() => {
        setEditedCamper(camper);
    }, [camper]);

    if (!isOpen) return null;

    const handleEditClick = () => {
        setIsEditMode(true);
        if (onEdit) {
            onEdit();
        }
    };

    const handleSave = () => {
        // TODO: Add save logic here (e.g., API call)
        setIsEditMode(false);
    };

    const handleCancel = () => {
        setEditedCamper(camper); // Reset to original values
        setIsEditMode(false);
    };

    const handleFieldChange = (field: keyof CamperDetails, value: string | string[]) => {
        setEditedCamper(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const {
        name,
        bunk,
        swimLevel,
        emergencyMedication,
        conflicts,
    } = isEditMode ? editedCamper : camper;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-md bg-white p-6 text-camp-text-headingBody">
            <button
              onClick={onClose}
              className="absolute left-4 top-4"
            >
              <Image src={crossIcon} alt="Close" width={20} height={20} />
            </button>
            
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2">
              <div className="relative h-8 w-8">
                <Image src={avatarIcon} alt="Camper avatar"/>
              </div>
              <h2 className="text-xl font-semibold">{name}</h2>
            </div>

            {!isEditMode ? (
              <button
                onClick={handleEditClick}
                className="absolute right-4 top-3 px-3 text-camp-primary underline"
              >
                EDIT
              </button>
            ) : (
              <div className="absolute right-4 top-3 flex">
                <button
                  onClick={handleCancel}
                  className="px-3 text-camp-text-headingBody underline"
                >
                  X
                </button>
                <span className="text-camp-text-headingBody">|</span>
                <button
                  onClick={handleSave}
                  className="px-3 text-camp-primary underline font-semibold"
                >
                  SAVE
                </button>
              </div>
            )}


            <section className="mt-10 text-sm font-semibold">
              <div>
                <span className="font-semibold text-camp-text-headingBody italic">BUNK:</span>{" "}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedCamper.bunk}
                    onChange={(e) => handleFieldChange("bunk", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded"
                  />
                ) : (
                  <span>{bunk}</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-camp-text-headingBody italic">Swim Level:</span>{" "}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedCamper.swimLevel}
                    onChange={(e) => handleFieldChange("swimLevel", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded"
                  />
                ) : (
                  <span>{swimLevel}</span>
                )}
              </div>
    
              <div>
                <span className="font-semibold text-camp-text-headingBody">
                  Emergency Medication:
                </span>{" "}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedCamper.emergencyMedication || ""}
                    onChange={(e) => handleFieldChange("emergencyMedication", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded"
                  />
                ) : (
                  <span>{emergencyMedication?.trim() || "None reported"}</span>
                )}
              </div>
    
              <div className="flex items-start gap-3">
                <span className="font-semibold text-camp-text-headingBody mt-1">
                  Conflicts:
                </span>

                {isEditMode ? (
                  <textarea
                    value={editedCamper.conflicts.join(", ")}
                    onChange={(e) => handleFieldChange("conflicts", e.target.value.split(", ").filter(c => c.trim()))}
                    className="border border-black bg-gray-100 p-3 text-sm text-camp-text-headingBody italic flex-1 rounded"
                    rows={3}
                  />
                ) : (
                  <div className="border border-black bg-gray-100 p-3 text-sm text-camp-text-headingBody italic flex-1">
                    {conflicts.length > 0 ? conflicts.join(", ") : "None"}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      );
}