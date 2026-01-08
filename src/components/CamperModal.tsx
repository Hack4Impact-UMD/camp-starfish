"use client";

import React, { useState, useEffect } from "react";
import { CamperAttendeeID } from "@/types/sessionTypes";
import { modals } from "@mantine/modals";
import { getFullName } from "@/utils/personUtils";
import {
  ActionIcon,
  NumberInput,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { MdAccountCircle, MdCancel, MdEdit, MdSave } from "react-icons/md";

type CamperModalProps = {
  camper: CamperAttendeeID;
};

export default function CamperModal({ camper }: CamperModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCamper, setEditedCamper] = useState(camper);

  // Update edited camper when camper prop changes
  useEffect(() => {
    setEditedCamper(camper);
  }, [camper]);

  const handleSave = () => {
    // TODO: Add save logic here (e.g., API call)
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedCamper(camper); // Reset to original values
    setIsEditMode(false);
  };

  const handleFieldChange = (
    field: keyof CamperAttendeeID,
    value: string | string[] | number
  ) => {
    setEditedCamper((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const { bunk, level, healthInfo, nonoList } = isEditMode
    ? editedCamper
    : camper;

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <MdAccountCircle size={50} />
          <Title order={2}>{getFullName(camper)}</Title>
        </div>
        {!isEditMode ? (
          <ActionIcon onClick={() => setIsEditMode(true)} color="aqua">
            <MdEdit />
          </ActionIcon>
        ) : (
          <div className="flex gap-1">
            <ActionIcon color="success" onClick={handleSave}>
              <MdSave />
            </ActionIcon>
            <ActionIcon color="error" onClick={handleCancel}>
              <MdCancel />
            </ActionIcon>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-5">
        <NumberInput
          label="Bunk"
          value={bunk}
          disabled={!isEditMode}
          onChange={(value) => handleFieldChange("bunk", value)}
        />
        <NumberInput
          label="Swim Level"
          value={level}
          disabled={!isEditMode}
          onChange={(value) => handleFieldChange("level", value)}
        />
        <TextInput
          label="Health Info"
          value={healthInfo}
          disabled={!isEditMode}
          onChange={(e) => handleFieldChange("healthInfo", e.target.value)}
        />
        <Textarea
          label="Conflicts"
          value={editedCamper.nonoList.join(", ")}
          disabled={!isEditMode}
          onChange={(e) =>
            handleFieldChange(
              "nonoList",
              e.target.value.split(", ").filter((c) => c.trim())
            )
          }
          rows={3}
        />
      </section>
    </div>
  );
}

export function openCamperModal(props: CamperModalProps) {
  modals.open({
    title: "Camper",
    children: <CamperModal {...props} />,
  });
}
