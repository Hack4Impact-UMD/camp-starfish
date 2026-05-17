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
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import moment, { Moment } from "moment";
import useCreateSection from "@/hooks/sections/useCreateSection";
import useUpdateSection from "@/hooks/sections/useUpdateSection";
import useDeleteSection from "@/hooks/sections/useDeleteSection";
import { Section, SectionType } from "@/types/sessions/sessionTypes";
import useSection from "@/hooks/sections/useSection";
import { modals } from "@mantine/modals";
import ErrorPage from "@/app/error";
import LoadingAnimation from "./LoadingAnimation";
import {
  getFullSectionTypeName,
  sectionTypes,
} from "@/types/sessions/sessionUtils";

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

  if (sectionQuery.isError) {
    return <ErrorPage error={sectionQuery.error} />;
  } else if (sectionQuery.isLoading) {
    return <LoadingAnimation />;
  } else if (sectionId && sectionQuery.isSuccess) {
    return <EditSectionModalContent section={sectionQuery.data} />;
  }
  return (
    <EditSectionModalContent
      sessionId={sessionId}
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
    />
  );
}

type EditSectionModalContentProps =
  | {
      section: Section;
      sessionId?: never;
      initialStartDate?: never;
      initialEndDate?: never;
    }
  | {
      sessionId: string;
      initialStartDate?: Moment;
      initialEndDate?: Moment;
      section?: never;
    };

export function EditSectionModalContent(props: EditSectionModalContentProps) {
  const { sessionId, section, initialStartDate, initialEndDate } = props;

  const isEditMode = !!section;

  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    (isEditMode
      ? moment(section.startDate).toDate()
      : initialStartDate?.toDate()) ?? null,
    (isEditMode
      ? moment(section.endDate).toDate()
      : initialEndDate?.toDate()) ?? null,
  ]);
  const [scheduleType, setScheduleType] = useState<SectionType | null>(
    section?.type ?? null,
  );
  const [name, setName] = useState<string>(section?.name ?? "");

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

  const handleSubmit = () => {
    if (!dateRange[0] || !dateRange[1] || !name || !scheduleType) return;
    if (isEditMode) {
      updateSectionMutation.mutate(
        {
          sessionId: section.sessionId,
          sectionId: section.id,
          name,
          startDate: moment(dateRange[0]),
          endDate: moment(dateRange[1]),
          type: scheduleType,
        },
        {
          onSuccess: () => modals.closeAll(),
        },
      );
    } else {
      createSectionMutation.mutate(
        {
          sessionId,
          name,
          startDate: moment(dateRange[0]),
          endDate: moment(dateRange[1]),
          type: scheduleType,
        },
        {
          onSuccess: () => modals.closeAll(),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!isEditMode) return;
    deleteSectionMutation.mutate({
      sessionId: section.sessionId,
      sectionId: section.id,
    });
  };

  const mutationIsPending =
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    deleteSectionMutation.isPending;

  return (
    <Box className="p-lg bg-white m-auto">
      <Stack className="gap-md">
        <TextInput
          label="Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.currentTarget.value)
          }
        />
        <DatePickerInput
          label="Dates"
          placeholder="Select section dates"
          type="range"
          value={dateRange}
          onChange={setDateRange}
          valueFormat="MMM DD, YYYY"
        />

        <Radio.Group
          label="Schedule Type"
          value={scheduleType}
          onChange={(newScheduleType) =>
            setScheduleType(newScheduleType as SectionType)
          }
        >
          <Stack className="gap-xs">
            {sectionTypes.map((type: SectionType) => (
              <Radio value={type} label={getFullSectionTypeName(type)} />
            ))}
          </Stack>
        </Radio.Group>

        <Group className="justify-center gap-sm">
          {true && (
            <Button
              color="error"
              onClick={handleDelete}
              loading={deleteSectionMutation.isPending}
              disabled={mutationIsPending}
            >
              Delete
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            loading={
              isEditMode
                ? updateSectionMutation.isPending
                : createSectionMutation.isPending
            }
            disabled={!name || !dateRange[0] || !dateRange[1] || !scheduleType || mutationIsPending}
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
    title: props.sectionId ? "Edit Section" : "Create Section",
    children: <EditSectionModal {...props} />,
  });
}
