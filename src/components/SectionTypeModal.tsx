import { useState } from "react";
import {
  Button,
  Group,
  Radio,
  TextInput,
  Stack,
  Box,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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
}

export default function SectionTypeModal({
  sessionId,
  sectionId,
  selectedStartDate,
  selectedEndDate,
}: SectionTypeModalProps) {
  const [startDate, setStartDate] = useState<Moment | null>(selectedStartDate);
  const [endDate, setEndDate] = useState<Moment | null>(selectedEndDate);
  const [scheduleType, setScheduleType] = useState<SectionType>("BUNDLE");
  const [name, setName] = useState("");

  const { data: section, isLoading: isLoadingSection } = useSection(
    sessionId,
    sectionId
  );
  const isEditMode = true;//!!sectionId;

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  // Current date format - "Wednesday, October 29, 2025"
  const formatDate = (date: Moment) => {
    return moment(date).format("dddd, MMMM D, YYYY");
  };

  const handleStartDateChange = (value: string | null) => {
    setStartDate(value ? moment(value) : null);
  };
  const handleEndDateChange = (value: string | null) => {
    setEndDate(value ? moment(value) : null);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !name) return;

    const sectionType = mapScheduleTypeToSectionType(scheduleType);

    // Build section data based on type
    const baseSectionData = {
      name,
      type: sectionType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
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

    if (isEditMode) {
      updateMutation.mutate({ sessionId, sectionId, updates: sectionData });
    } else {
      createMutation.mutate({ sessionId, section: sectionData });
    }
  };

  const handleDelete = () => {
    if (!sectionId) return;
    deleteMutation.mutate({ sessionId, sectionId });
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isLoadingSection;

  return (
    <Box className="p-lg bg-white border-[2px] border-solid border-blue-8 rounded-md m-auto">
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ blur: 2 }}
        classNames={{
          overlay: "blur-xs",
        }}
      />

      <Stack className="gap-md">
        {/* Date range selection (start date to end date) */}
        <Box>
          <Text className="mb-sm">Date(s)</Text>
          <Group>
            {/* Start date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="Start Date"
              value={startDate?.toDate()}
              onChange={handleStartDateChange}
              valueFormat="ddd, MMM D"
              classNames={{
                root: "flex-1",
                input: "size-sm rounded-md w-full",
              }}
            />
            <Text>to</Text>
            {/* End date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="End Date"
              value={endDate?.toDate()}
              onChange={handleEndDateChange}
              valueFormat="ddd, MMM D"
              classNames={{
                root: "flex-1",
                input: "size-sm rounded-md w-full",
              }}
            />
          </Group>
        </Box>

        {/* Schedule type radio selection */}
        <Box>
          <Text className="my-sm">Schedule Type</Text>
          <Radio.Group
            label="Schedule Type"
            value={scheduleType}
            onChange={(newScheduleType) =>
              setScheduleType(newScheduleType as SectionType)
            }
            classNames={{
              label: "text-md",
            }}
          >
            <Stack className="gap-xs">
              <Radio
                value={"BUNK-JAMBO" satisfies SectionType}
                label="Bunk Jamboree"
              />
              <Radio
                value={"NON-BUNK-JAMBO" satisfies SectionType}
                label="Non-Bunk Jamboree"
              />
              <Radio value={"BUNDLE" satisfies SectionType} label="Bundle" />
              <Radio
                value={"COMMON" satisfies SectionType}
                label="Non-Scheduling"
              />
            </Stack>
          </Radio.Group>
        </Box>

        <TextInput
          label="Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.currentTarget.value)
          }
          classNames={{
            root: "w-3/4",
            label: "text-md",
          }}
        />

        {/* Action buttons: Delete and Done */}
        <Group justify="center" gap="sm" mt="md">
          {isEditMode && (
            <Button
              color="error"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              disabled={isLoading}
              classNames={{
                root: "flex-1",
              }}
            >
              Delete
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
            disabled={!name || !startDate || isLoading}
            classNames={{
              root: "flex-1",
            }}
          >
            {isEditMode ? "Save Changes" : "Create"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
