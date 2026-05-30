"use client";

import { useState } from "react";
import {
  Button,
  Radio,
  TextInput,
  Stack,
  Box,
  Text,
  Group,
  ActionIcon,
  Divider,
  Modal,
} from "@mantine/core";
import { MdClose, MdDeleteOutline } from "react-icons/md";
import {
  BundleActivity,
  JamboreeActivity,
} from "@/types/scheduling/schedulingTypes";
import { AgeGroup, SchedulingSectionType } from "@/types/sessions/sessionTypes";
import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import ActivityTagManagementModal, { TagData } from "./ActivityTagManagementModal";

export interface CreateActivityModalProps {
  opened: boolean;
  onClose: () => void;
  sectionType: SchedulingSectionType;
  existingActivity?: BundleActivity | JamboreeActivity;
  onSubmit: (activity: BundleActivity | JamboreeActivity) => void;
  onDelete?: (activityId: string) => void;
  tagData: TagData;
  onTagDataChange: (tagData: TagData) => void;
}

export default function CreateActivityModal({
  opened,
  onClose,
  sectionType,
  existingActivity,
  onSubmit,
  onDelete,
  tagData,
  onTagDataChange,
}: CreateActivityModalProps) {
  const isEditMode = !!existingActivity;
  const isBundleSection = sectionType === "BUNDLE";

  const [tagModalOpened, setTagModalOpened] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);

  const handleSubmit = () => {
    if (!activityName.trim()) return;

    // Add category and activity to tag data if they're new
    const updatedTagData = { ...tagData };
    const trimmedCategory = categoryName.trim();
    const trimmedActivity = activityName.trim();

    if (isBundleSection && !trimmedCategory) return;

    if (trimmedCategory) {
      // Add category if new
      if (!updatedTagData.categories.includes(trimmedCategory)) {
        updatedTagData.categories = [...updatedTagData.categories, trimmedCategory];
        updatedTagData.activitiesByCategory = {
          ...updatedTagData.activitiesByCategory,
          [trimmedCategory]: [],
        };
      }
      // Add activity under that category if new
      const existingActivities = updatedTagData.activitiesByCategory[trimmedCategory] ?? [];
      if (!existingActivities.includes(trimmedActivity)) {
        updatedTagData.activitiesByCategory = {
          ...updatedTagData.activitiesByCategory,
          [trimmedCategory]: [...existingActivities, trimmedActivity],
        };
      }
      onTagDataChange(updatedTagData);
    }

    if (isBundleSection) {
      if (!ageGroup) return;
      const activity: BundleActivity = {
        id: existingActivity?.id ?? crypto.randomUUID(),
        name: trimmedActivity,
        description: existingActivity?.description ?? "",
        programAreaId: trimmedCategory,
        ageGroup,
      };
      onSubmit(activity);
    } else {
      const activity: JamboreeActivity = {
        id: existingActivity?.id ?? crypto.randomUUID(),
        name: trimmedActivity,
        description: existingActivity?.description ?? "",
      };
      onSubmit(activity);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingActivity && onDelete) {
      onDelete(existingActivity.id);
      onClose();
    }
  };

  const isFormValid = isBundleSection
    ? !!activityName.trim() && !!categoryName.trim() && !!ageGroup
    : !!activityName.trim();

  // Reset the form fields whenever the modal opens or switches to a different
  // activity. Tracking the previous "open key" during render (instead of an
  // effect) avoids a synchronous setState in useEffect.
  const formKey = opened ? existingActivity?.id ?? "new" : null;
  const [lastFormKey, setLastFormKey] = useState<string | null>(null);
  if (formKey !== null && formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setCategoryName(
      existingActivity && isBundleActivity(existingActivity)
        ? existingActivity.programAreaId
        : ""
    );
    setActivityName(existingActivity?.name ?? "");
    setAgeGroup(
      existingActivity && isBundleActivity(existingActivity)
        ? existingActivity.ageGroup
        : null
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="md"
      radius={16}
      padding={0}
      zIndex={300}
      classNames={{
        content: "border border-solid border-[#dee1e3]",
      }}
    >
      <Box className="flex flex-col items-center gap-4 bg-white rounded-[16px] px-6 pt-4 pb-6">
        {/* Top row: close (left), manage tags + delete (right) */}
        <Group justify="space-between" align="flex-start" w="100%">
          <ActionIcon
            variant="transparent"
            size="sm"
            aria-label="Close"
            onClick={onClose}
          >
            <MdClose size={18} className="text-[#002d45]" />
          </ActionIcon>
          <Group gap={8} align="center">
            <Button
              variant="default"
              onClick={() => setTagModalOpened(true)}
              styles={{
                root: {
                  height: 26,
                  backgroundColor: "#fafafb",
                  border: "1px solid #c1c1c1",
                  borderRadius: 8,
                  paddingInline: 10,
                },
                label: { color: "#001b2a", fontSize: 13, fontWeight: 500 },
              }}
            >
              Manage Tags
            </Button>
            {isEditMode && onDelete && (
              <ActionIcon
                variant="transparent"
                size="sm"
                aria-label="Delete activity"
                onClick={handleDelete}
              >
                <MdDeleteOutline size={16} className="text-[#002d45]" />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Body */}
        <Stack className="w-full" gap={28}>
          <Stack gap={20}>
            {/* Editable category name with underline */}
            <Box className="w-full">
              <TextInput
                placeholder={isEditMode ? "Edit Event Category" : "Add Event Category"}
                value={categoryName}
                onChange={(e) => setCategoryName(e.currentTarget.value)}
                variant="unstyled"
                styles={{
                  input: {
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#3b4e57",
                    padding: 0,
                    height: "auto",
                    lineHeight: 1.3,
                  },
                }}
              />
              <Divider color="#c1c1c1" />
            </Box>

            {/* Activity Title input */}
            <TextInput
              placeholder="Add Activity Title"
              value={activityName}
              onChange={(e) => setActivityName(e.currentTarget.value)}
              radius={8}
              size="sm"
              styles={{
                input: {
                  border: "1px solid #c1c1c1",
                  color: "#3b4e57",
                },
              }}
            />
          </Stack>

          {/* Schedule Type (age group) - only for Bundle sections */}
          {isBundleSection && (
            <Stack className="w-full" gap={10}>
              <Text style={{ fontSize: 16, fontWeight: 600, color: "#3b4e57" }}>
                Schedule Type
              </Text>
              <Radio.Group
                value={ageGroup}
                onChange={(value) => setAgeGroup(value as AgeGroup)}
              >
                <Stack gap={12}>
                  <Radio
                    value="OCP"
                    label="OCP"
                    size="sm"
                    color="#002d45"
                    styles={{ label: { fontSize: 14, color: "#12222a" } }}
                  />
                  <Radio
                    value="NAV"
                    label="NAV"
                    size="sm"
                    color="#002d45"
                    styles={{ label: { fontSize: 14, color: "#12222a" } }}
                  />
                </Stack>
              </Radio.Group>
            </Stack>
          )}
        </Stack>

        {/* Save button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          radius={40}
          styles={{
            root: { backgroundColor: "#002d45", height: 42, width: 180 },
            label: {
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
            },
          }}
        >
          SAVE CHANGES
        </Button>
      </Box>
      {/* Tag Management Modal */}
      <ActivityTagManagementModal
        opened={tagModalOpened}
        onClose={() => setTagModalOpened(false)}
        tagData={tagData}
        onSave={onTagDataChange}
      />
    </Modal>
  );
}