import useCreateActivity from "@/features/sessions/sections/useCreateActivity";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import { Radio, Textarea, TextInput } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useSuspenseQuery } from "@tanstack/react-query";

interface CreateActivityModalProps {
  sessionId: string;
  sectionId: string;
  blockId: string;
}

function CreateActivityModal(props: CreateActivityModalProps) {
  const { sessionId, sectionId, blockId } = props;

  const sectionScheduleQuery = useSuspenseQuery(
    sectionScheduleQueryOptions(sessionId, sectionId),
  );

  const createActivityMutation = useCreateActivity();

  return (
    <div>
      <TextInput label="Activity Name" />
      <Textarea label="Activity Description" />
      {sectionScheduleQuery.data.type === "BUNDLE" && (
        <Radio.Group label="Age Group">
          {AGE_GROUPS.map((ageGroup) => (
            <Radio value={ageGroup} label={ageGroup} />
          ))}
        </Radio.Group>
      )}
    </div>
  );
}

export default function openCreateActivityModal(
  props: CreateActivityModalProps,
) {
  openModal({
    title: "Create Activity",
    children: <CreateActivityModal {...props} />,
  });
}
