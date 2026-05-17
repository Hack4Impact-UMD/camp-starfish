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
import { SectionType } from "@/types/sessions/sessionTypes";
import useSection from "@/hooks/sections/useSection";
import { modals } from "@mantine/modals";

type EditSectionModalProps =
  | {
      sessionId: string;
      sectionId?: never;
      initialStartDate: Moment;
      initialEndDate: Moment;
    }
  | {
      sessionId: string;
      sectionId: string;
      initialStartDate?: never;
      initialEndDate?: never;
    };

export function EditSectionModal(props: EditSectionModalProps) {
  const { sessionId, sectionId, initialStartDate, initialEndDate } = props;

  const sectionQuery = useSection(sessionId, sectionId);
  const isEditMode = !!sectionId;

  if (sectionQuery.isError || sectionQuery.isLoading) return <></>
  const section = sectionQuery.data;

  const [startDate, setStartDate] = useState<Moment | null>(
    (isEditMode ? moment(section!.startDate) : initialStartDate) ?? null,
  );
  const [endDate, setEndDate] = useState<Moment | null>(
    (isEditMode ? moment(section!.endDate) : initialEndDate) ?? null,
  );
  const [scheduleType, setScheduleType] = useState<SectionType | null>(
    section?.type ?? null,
  );
  const [name, setName] = useState<string>(section?.name ?? "");

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

  const handleStartDateChange = (value: string | null) => {
    setStartDate(value ? moment(value) : null);
  };
  const handleEndDateChange = (value: string | null) => {
    setEndDate(value ? moment(value) : null);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !name || !scheduleType) return;
    if (isEditMode) {
      updateSectionMutation.mutate(
        { sessionId, sectionId, name, startDate, endDate, type: scheduleType },
        {
          onSuccess: () => modals.closeAll(),
        },
      );
    } else {
      createSectionMutation.mutate(
        { sessionId, name, startDate, endDate, type: scheduleType },
        {
          onSuccess: () => modals.closeAll(),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!sectionId) return;
    deleteSectionMutation.mutate({ sessionId, sectionId });
  };

  const isLoading =
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    deleteSectionMutation.isPending ||
    sectionQuery.isLoading;

  return (
    <Box className="p-lg bg-white m-auto">
      <LoadingOverlay
        visible={isLoading}
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
        <Group className="justify-center gap-sm">
          {isEditMode && (
            <Button
              color="error"
              onClick={handleDelete}
              loading={deleteSectionMutation.isPending}
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
            loading={createSectionMutation.isPending || updateSectionMutation.isPending}
            disabled={!name || !startDate || isLoading}
            classNames={{
              root: "flex-1",
            }}
          >
            {isEditMode ? "Save Changes" : "Create Section"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default function openEditSectionModal(props: EditSectionModalProps) {
  modals.open({
    title: "Create Section",
    children: <EditSectionModal {...props} />,
  });
}
