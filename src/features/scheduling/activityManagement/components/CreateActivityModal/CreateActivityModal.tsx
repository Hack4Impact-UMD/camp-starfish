import useCreateActivity, { CreateBundleActivityRequestSchema, CreateJamboreeActivityRequestSchema } from "@/features/sessions/sections/useCreateActivity";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import { AGE_GROUPS, SchedulingSectionType } from "@/types/sessions/sessionTypes";
import { Radio, Textarea, TextInput } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import z from "zod";

interface CreateActivityModalProps {
  sessionId: string;
  sectionId: string;
  blockId: string;
}

const CreateBundleActivityFormDataSchema = CreateBundleActivityRequestSchema.omit({ sessionId: true, sectionId: true, blockId: true });
type CreateBundleActivityFormData = z.infer<typeof CreateBundleActivityFormDataSchema>;
const CreateJamboreeActivityFormDataSchema = CreateJamboreeActivityRequestSchema.omit({ sessionId: true, sectionId: true, blockId: true });
type CreateJamboreeActivityFormData = z.infer<typeof CreateJamboreeActivityFormDataSchema>;
const CreateActivityFormDataSchema = z.union([CreateJamboreeActivityFormDataSchema, CreateBundleActivityFormDataSchema]);
type CreateActivityFormData = z.infer<typeof CreateActivityFormDataSchema>;

function getCreateActivityFormDefaultValues(type: SchedulingSectionType) {
  return type === "BUNDLE" ? {
    name: "",
    description: "",
    ageGroup: "NAV",
    programAreaId: ""
  } satisfies CreateBundleActivityFormData : {
    name: "",
    description: ""
  } satisfies CreateJamboreeActivityFormData
}

function CreateActivityModal(props: CreateActivityModalProps) {
  const { sessionId, sectionId, blockId } = props;

  const sectionScheduleQuery = useSuspenseQuery(
    sectionScheduleQueryOptions(sessionId, sectionId),
  );

  const createActivityMutation = useCreateActivity();

  const form = useForm({
    defaultValues: getCreateActivityFormDefaultValues(sectionScheduleQuery.data.type)
  })

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
