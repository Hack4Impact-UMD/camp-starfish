"use client";

import { useState } from "react";
import {
  Button,
  Stack,
  Box,
  Text,
  Title,
  Pill,
  Select,
  Modal,
  Divider,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export interface TagData {
  categories: string[];
  activitiesByCategory: Record<string, string[]>;
}

interface ActivityTagManagementModalProps {
  opened: boolean;
  onClose: () => void;
  tagData: TagData;
  onSave: (tagData: TagData) => void;
}

export default function ActivityTagManagementModal({
  opened,
  onClose,
  tagData,
  onSave,
}: ActivityTagManagementModalProps) {
  const [categories, setCategories] = useState<string[]>(tagData.categories);
  const [activitiesByCategory, setActivitiesByCategory] = useState<
    Record<string, string[]>
  >(tagData.activitiesByCategory);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [activityInput, setActivityInput] = useState("");

  // Sync state when tagData changes (e.g. from CreateActivityModal adding a new tag)
  const [prevTagData, setPrevTagData] = useState(tagData);
  if (tagData !== prevTagData) {
    setCategories(tagData.categories);
    setActivitiesByCategory(tagData.activitiesByCategory);
    setPrevTagData(tagData);
  }

  const removeCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
    setActivitiesByCategory((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    if (selectedCategory === category) {
      setSelectedCategory(null);
    }
  };

  const addCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setActivitiesByCategory((prev) => ({ ...prev, [trimmed]: [] }));
      setCategoryInput("");
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
  };

  const removeActivity = (activity: string) => {
    if (!selectedCategory) return;
    setActivitiesByCategory((prev) => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter((a) => a !== activity),
    }));
  };

  const addActivity = () => {
    if (!selectedCategory) return;
    const trimmed = activityInput.trim();
    const currentActivities = activitiesByCategory[selectedCategory] ?? [];
    if (trimmed && !currentActivities.includes(trimmed)) {
      setActivitiesByCategory((prev) => ({
        ...prev,
        [selectedCategory]: [...(prev[selectedCategory] ?? []), trimmed],
      }));
      setActivityInput("");
    }
  };

  const handleActivityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addActivity();
    }
  };

  const handleSave = () => {
    onSave({ categories, activitiesByCategory });
    onClose();
  };

  const currentActivities = selectedCategory
    ? (activitiesByCategory[selectedCategory] ?? [])
    : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton
      closeButtonProps={{ size: "lg" }}
      size="lg"
      zIndex={400}
      classNames={{
        header: "pb-0",
        title: "hidden",
      }}
    >
      <Stack className="gap-lg">
        {/* Header */}
        <Box className="text-center">
          <Title order={2} className="text-xl font-bold">
            Activities Tag Management
          </Title>
          <Text className="text-sm text-red-600 mt-xs">
            Deleting used tags could corrupt generated schedules*
          </Text>
          <Text className="text-sm text-red-600">
            Edits on this screen will be applied to all users**
          </Text>
        </Box>

        <Divider />

        {/* Category section */}
        <Box>
          <Title order={3} className="text-lg font-semibold">
            Category
          </Title>
          <Text className="text-sm text-red-600 mb-sm">
            Deleting category titles will delete associated activities names
          </Text>

          <Box className="border border-solid border-blue-300 rounded-md p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <IconSearch size={16} className="text-gray-400" />
              {categories.map((category) => (
                <Pill
                  key={category}
                  withRemoveButton
                  onRemove={() => removeCategory(category)}
                  styles={{
                    root: {
                      backgroundColor: "#e9ecef",
                    },
                  }}
                >
                  {category}
                </Pill>
              ))}
              <input
                className="border-none outline-none bg-transparent text-sm flex-grow min-w-[100px]"
                placeholder="Add category..."
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
              />
            </div>
          </Box>
        </Box>

        <Divider />

        {/* Activity section */}
        <Box>
          <Title order={3} className="text-lg font-semibold mb-sm">
            Activity
          </Title>

          <Select
            placeholder="Select Activity Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            data={categories.map((c) => ({ value: c, label: c }))}
            className="mb-sm"
            styles={{
              input: {
                backgroundColor: "white",
                border: "1px solid #dee2e6",
              },
            }}
          />

          <Box className="border border-solid border-blue-300 rounded-md p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <IconSearch size={16} className="text-gray-400" />
              {currentActivities.map((activity) => (
                <Pill
                  key={activity}
                  withRemoveButton
                  onRemove={() => removeActivity(activity)}
                  styles={{
                    root: {
                      backgroundColor: "#e9ecef",
                    },
                  }}
                >
                  {activity}
                </Pill>
              ))}
              <input
                className="border-none outline-none bg-transparent text-sm flex-grow min-w-[100px]"
                placeholder={
                  selectedCategory
                    ? "Add activity..."
                    : "Select a category first"
                }
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyDown={handleActivityKeyDown}
                disabled={!selectedCategory}
              />
            </div>
          </Box>
        </Box>

        {/* Save button */}
        <Button fullWidth color="dark" size="md" onClick={handleSave}>
          SAVE CHANGES
        </Button>
      </Stack>
    </Modal>
  );
}
