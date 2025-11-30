import { useState } from "react";
import {
  Button,
  Group,
  Radio,
  TextInput,
  Title,
  Stack,
  Box,
  Text,
  ActionIcon,
  LoadingOverlay,
  Modal,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { X } from "lucide-react";
import { notifications } from "@mantine/notifications";
import moment, { Moment } from "moment";
import useCreateSection from "@/hooks/sections/useCreateSection";
import useUpdateSection from "@/hooks/sections/useUpdateSection";
import useDeleteSection from "@/hooks/sections/useDeleteSection";
import {
  mapScheduleTypeToSectionType,
  getDefaultNumBlocks,
  isSchedulingSectionType,
} from "@/utils/sections";
import {
  Section,
  SchedulingSection,
  CommonSection,
  SectionType,
} from "@/types/sessionTypes";
import useSection from "@/hooks/sections/useSection";

interface SectionTypeModalProps {
  sessionId: string;
  sectionId?: string;
  selectedStartDate: Moment;
  selectedEndDate: Moment;

  onSubmit: (data: {
    startDate: Moment | null;
    endDate: Moment | null;
    scheduleType: string;
    name: string;
  }) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export default function SectionTypeModal({
  sessionId,
  sectionId,
  selectedStartDate,
  selectedEndDate,
  onSubmit,
  onDelete,
  onClose,
}: SectionTypeModalProps) {
  const [startDate, setStartDate] = useState<Moment | null>(selectedStartDate);
  const [endDate, setEndDate] = useState<Moment | null>(selectedEndDate);
  const [scheduleType, setScheduleType] = useState<SectionType>("BUNDLE");
  const [name, setName] = useState("");

  // Fetch existing section data if in edit mode
  const { data: existingSection, isLoading: isLoadingSection } = useSection(
    sessionId,
    sectionId || ""
  );

  // React Query mutations
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  // Current date format - "Wednesday, October 29, 2025"
  const formatDate = (date: Moment) => {
    return moment(date).format("dddd, MMMM D, YYYY");
  };

  const handleStartDateChange = (value: string | null) => {
    if (value) {
      // Use moment to parse YYYY-MM-DD as local date
      const localDate = moment(value);
      setStartDate(localDate);
    } else {
      setStartDate(null);
    }
  };

  const handleEndDateChange = (value: string | null) => {
    if (value) {
      // Use moment to parse YYYY-MM-DD as local date
      const localDate = moment(value);
      setEndDate(localDate);
    } else {
      setEndDate(null);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !name) return;

    const sectionType = mapScheduleTypeToSectionType(scheduleType);
    const finalEndDate = endDate || startDate;

    // Build section data based on type
    const baseSectionData = {
      name,
      type: sectionType,
      startDate: startDate.toISOString(),
      endDate: finalEndDate.toISOString(),
    };

    let sectionData: Section;

    if (isSchedulingSectionType(sectionType)) {
      sectionData = {
        ...baseSectionData,
        type: sectionType,
        numBlocks: getDefaultNumBlocks(scheduleType),
      } as SchedulingSection;
    } else {
      sectionData = {
        ...baseSectionData,
        type: "COMMON",
      } as CommonSection;
    }

    try {
      if (sectionId) {
        // UPDATE MODE
        await updateMutation.mutateAsync({
          sectionId,
          sessionId,
          updates: sectionData,
        });
        notifications.show({
          title: "Success",
          message: "Section updated successfully!",
          color: "green",
        });
      } else {
        // CREATE MODE
        await createMutation.mutateAsync({ sessionId, section: sectionData });
        notifications.show({
          title: "Success",
          message: "Section created successfully!",
          color: "green",
        });
      }

      // Call the onSubmit callback for backward compatibility
      onSubmit({ startDate, endDate, scheduleType, name });
      onClose?.();
    } catch (error) {
      console.error("Error saving section:", error);
      notifications.show({
        title: "Error",
        message: `Failed to ${
          sectionId ? "update" : "create"
        } section. Please try again.`,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    if (!sectionId) return;

    try {
      await deleteMutation.mutateAsync({ sectionId, sessionId });
      notifications.show({
        title: "Success",
        message: "Section deleted successfully!",
        color: "green",
      });
      onDelete?.();
      onClose?.();
    } catch (error) {
      console.error("Error deleting section:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete section. Please try again.",
        color: "red",
      });
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isLoadingSection;

  return (
    <Box
      p="lg"
      bg="white"
      bd="2px solid #002D45"
      style={{
        borderRadius: 8,
        maxWidth: 400,
        margin: "auto",
        position: "relative",
      }}
    >
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

      {/* Close button (X) in top left corner */}
      <ActionIcon
        variant="subtle"
        onClick={onClose}
        aria-label="Close"
        c="primary.5"
        pos="absolute"
        top={16}
        left={16}
        disabled={isLoading}
      >
        <X size={24} strokeWidth={3} />
      </ActionIcon>

      {/* Modal title */}
      <Title order={2} ta="center" mb="md" mt="sm" c="primary.5">
        Choose Section Type
      </Title>

      {/* Current Date */}
      <Group justify="center" mb="lg" gap="md">
        <Text ta="center">{formatDate(selectedStartDate)}</Text>
      </Group>

      <Stack gap="md">
        {/* Date range selection (start date to end date) */}
        <Box>
          <Text mb="xs">Date(s)</Text>
          <Group>
            {/* Start date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="Start date"
              value={startDate?.toDate()}
              onChange={handleStartDateChange}
              valueFormat="ddd, MMM D"
              radius="md"
              size="sm"
              w={140}
            />
            <Text>to</Text>
            {/* End date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="End date"
              value={endDate?.toDate()}
              onChange={handleEndDateChange}
              valueFormat="ddd, MMM D"
              radius="md"
              size="sm"
              w={140}
            />
          </Group>
        </Box>

        {/* Schedule type radio selection */}
        <Box>
          <Text mb="xs" mt="sm">
            Schedule Type
          </Text>
          <Radio.Group value={scheduleType} onChange={setScheduleType}>
            <Stack gap="xs">
              <Radio value="Bunk Jamboree" label="Bunk Jamboree" />
              <Radio value="Non-Bunk Jamboree" label="Non-Bunk Jamboree" />
              <Radio value="Bundle" label="Bundle" />
              <Radio value="Non-Scheduling" label="Non-Scheduling" />
            </Stack>
          </Radio.Group>
        </Box>

        {/* Name input field for section identifier */}
        <Box>
          <Text mb="xs" mt="sm">
            Name
          </Text>
          <TextInput
            placeholder="e.g. Bundle 1"
            value={name}
            w={250}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.currentTarget.value)
            }
          />
        </Box>

        {/* Action buttons: Delete and Done */}
        <Group justify="center" gap="sm" mt="md">
          {sectionId && (
            <Button
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              disabled={isLoading}
              bg="#dc2626"
              style={{ flex: 0.375 }}
            >
              Delete
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
            disabled={!name || !startDate || isLoading}
            bg="#1e3a5f"
            style={{ flex: sectionId ? 0.375 : 1 }}
          >
            {sectionId ? "Update" : "Create"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
