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
  Combobox,
  useCombobox,
} from "@mantine/core";
import { MdClose, MdDeleteOutline } from "react-icons/md";
import {
  BundleActivity,
  JamboreeActivity,
} from "@/types/scheduling/schedulingTypes";
import { AgeGroup, SchedulingSectionType } from "@/types/sessions/sessionTypes";
import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import ActivityTagManagementModal, { TagData } from "./ActivityTagManagementModal";
import { v4 as uuid } from "uuid";

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

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const filteredCategories = tagData.categories.filter((c) =>
    c.toLowerCase().includes(categoryName.toLowerCase().trim())
  );

  const handleCategorySelect = (value: string) => {
    setCategoryName(value);
    combobox.closeDropdown();
  };

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
        id: existingActivity?.id ?? uuid(),
        name: trimmedActivity,
        description: existingActivity?.description ?? "",
        programAreaId: trimmedCategory,
        ageGroup,
      };
      onSubmit(activity);
    } else {
      const activity: JamboreeActivity = {
        id: existingActivity?.id ?? uuid(),
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
        content: "border border-solid border-neutral-3",
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
            <MdClose size={18} className="text-navy-9" />
          </ActionIcon>
          <Group gap={8} align="center">
            <Button
              variant="default"
              onClick={() => setTagModalOpened(true)}
              styles={{
                root: {
                  height: 26,
                  backgroundColor: "var(--mantine-color-neutral-1)",
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
                <MdDeleteOutline size={16} className="text-navy-9" />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Body */}
        <Stack className="w-full" gap={28}>
          <Stack gap={20}>
            {/* Searchable category field */}
            <Box className="w-full">
              <Combobox
                store={combobox}
                onOptionSubmit={handleCategorySelect}
                withinPortal={false}
              >
                <Combobox.Target>
                  <input
                    className="w-full border-none outline-none bg-transparent"
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "var(--mantine-color-neutral-5)",
                      padding: 0,
                      lineHeight: 1.3,
                    }}
                    placeholder={isEditMode ? "Edit Event Category" : "Add Event Category"}
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.currentTarget.value);
                      combobox.openDropdown();
                      combobox.updateSelectedOptionIndex();
                    }}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {filteredCategories.length === 0 && categoryName.trim() ? (
                      <Combobox.Empty>
                        Press Save to create &ldquo;{categoryName.trim()}&rdquo;
                      </Combobox.Empty>
                    ) : (
                      filteredCategories.map((cat) => (
                        <Combobox.Option value={cat} key={cat}>
                          {cat}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
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
                  color: "var(--mantine-color-neutral-5)",
                },
              }}
            />
          </Stack>

          {/* Schedule Type (age group) - only for Bundle sections */}
          {isBundleSection && (
            <Stack className="w-full" gap={10}>
              <Text style={{ fontSize: 16, fontWeight: 600, color: "var(--mantine-color-neutral-5)" }}>
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
                    color="navy.9"
                    styles={{ label: { fontSize: 14, color: "#12222a" } }}
                  />
                  <Radio
                    value="NAV"
                    label="NAV"
                    size="sm"
                    color="navy.9"
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
            root: { backgroundColor: "var(--mantine-color-navy-9)", height: 42, width: 180 },
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
