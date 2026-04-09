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
import { IconTrash } from "@tabler/icons-react";
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
  const [categoryName, setCategoryName] = useState<string>(
    existingActivity && isBundleActivity(existingActivity)
      ? existingActivity.programAreaId
      : "",
  );
  const [activityName, setActivityName] = useState<string>(existingActivity?.name ?? "");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(
    existingActivity && isBundleActivity(existingActivity)
      ? existingActivity.ageGroup
      : null,
  );

  const handleSubmit = () => {
    if (!activityName.trim()) return;

    // Add category and activity to tag data if they're new
    const updatedTagData = { ...tagData };
    const trimmedCategory = categoryName.trim();
    const trimmedActivity = activityName.trim();

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
    ? !!activityName.trim() && !!ageGroup
    : !!activityName.trim();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton
      closeButtonProps={{ size: "lg" }}
      size="md"
      zIndex={300}
      classNames={{
        header: "pb-0",
        title: "hidden",
      }}
    >
      <Box className="bg-white">
        <Stack className="gap-lg">
          {/* Header row: editable category name + manage tags + delete */}
          <Group justify="space-between" align="flex-start">
            <Box className="flex-1">
              <TextInput
                placeholder={isEditMode ? "Edit Event Category" : "Add Event Category"}
                value={categoryName}
                onChange={(e) => setCategoryName(e.currentTarget.value)}
                variant="unstyled"
                styles={{
                  input: {
                    fontSize: "1.5rem",
                    fontWeight: 400,
                    color: "#495057",
                    padding: 0,
                  },
                }}
              />
              <Divider />
            </Box>
            <Group gap="xs">
              <Button
                variant="outline"
                color="gray"
                size="xs"
                onClick={() => setTagModalOpened(true)}
              >
                Manage Tags
              </Button>
              {isEditMode && onDelete && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={handleDelete}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Group>
          </Group>

          {/* Activity Title input */}
          <TextInput
            placeholder="Add Activity Title"
            value={activityName}
            onChange={(e) => setActivityName(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: "white",
                border: "1px solid #dee2e6",
              },
            }}
          />

          {/* Schedule Type (age group) - only for Bundle sections */}
          {isBundleSection && (
            <Box>
              <Text className="text-lg font-medium mb-xs">Schedule Type</Text>
              <Divider className="mb-sm" />
              <Radio.Group
                value={ageGroup}
                onChange={(value) => setAgeGroup(value as AgeGroup)}
              >
                <Stack className="gap-xs">
                  <Radio value="OCP" label="OCP" />
                  <Radio value="NAV" label="NAV" />
                </Stack>
              </Radio.Group>
            </Box>
          )}

          {/* Save button */}
          <Button
            fullWidth
            color="dark"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            SAVE CHANGES
          </Button>
        </Stack>
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
