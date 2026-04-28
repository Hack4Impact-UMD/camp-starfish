"use client";

import { useState, useEffect } from "react";
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
  Group,
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

interface ConfirmState {
  opened: boolean;
  message: string;
  onConfirm: () => void;
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
  const [confirm, setConfirm] = useState<ConfirmState>({
    opened: false,
    message: "",
    onConfirm: () => {},
  });

  // Sync state when tagData changes (e.g. from CreateActivityModal adding a new tag)
  useEffect(() => {
      setCategories(tagData.categories);
      setActivitiesByCategory(tagData.activitiesByCategory);
      setSelectedCategory((prev) => prev && tagData.categories.includes(prev) ? prev : null, 
      );
  }, [tagData]);

  const closeConfirm = () =>
    setConfirm({ opened: false, message: "", onConfirm: () => {} });

  const removeCategory = (category: string) => {
    setConfirm({
      opened: true,
      message:
        "This category title is currently being used in a current session. Deleting this category will corrupt the current schedule.",
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c !== category));
        setActivitiesByCategory((prev) => {
          const next = { ...prev };
          delete next[category];
          return next;
        });
        if (selectedCategory === category) {
          setSelectedCategory(null);
        }
        closeConfirm();
      },
    });
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
    setConfirm({
      opened: true,
      message:
        "This activity is currently being used in a generated session. Deleting this activity will corrupt the current schedule.",
      onConfirm: () => {
        setActivitiesByCategory((prev) => ({
          ...prev,
          [selectedCategory]: prev[selectedCategory].filter(
            (a) => a !== activity,
          ),
        }));
        closeConfirm();
      },
    });
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
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        withCloseButton
        closeButtonProps={{ size: "lg" }}
        size="lg"
        zIndex={400}
        overlayProps={{ backgroundOpacity: 0.35 }}
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
              comboboxProps={{ zIndex: 401 }}
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

      {/* Warning confirmation modal */}
      <Modal
        opened={confirm.opened}
        onClose={closeConfirm}
        withCloseButton={false}
        zIndex={500}
        overlayProps={{ backgroundOpacity: 0.35 }}
        centered
        size="md"
        styles={{
          inner: {
            paddingBottom: "15%",
          },
        }}
      >
        <Box className="text-center py-2">
          <Title order={3} className="text-xl font-bold mb-sm">
            WARNING!
          </Title>
          <Text className="text-sm text-gray-600 mb-lg">{confirm.message}</Text>
          <Group grow>
            <Button
              color="gray"
              variant="filled"
              size="lg"
              onClick={closeConfirm}
              style={{ color: 'black', fontWeight:'bold' }}
            >
              CANCEL
            </Button>
            <Button color="red" size="lg" onClick={confirm.onConfirm}
            style={{ color: 'white', fontWeight:'bold' }}
            >
              CONFIRM
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}