import useCreateActivity, {
  CreateBundleActivityRequestSchema,
  CreateJamboreeActivityRequestSchema,
} from "@/features/sessions/sections/useCreateActivity";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import {
  AGE_GROUPS,
  AgeGroup,
  SchedulingSectionType,
} from "@/types/sessions/sessionTypes";
import { Radio, Select, Textarea, TextInput } from "@mantine/core";
import { openModal } from "@mantine/modals";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { getUseProgramAreaListOptions } from "@/hooks/programAreas/useProgramAreaList";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";

interface CreateActivityModalProps {
  sessionId: string;
  sectionId: string;
  blockId: string;
}

const CreateBundleActivityFormDataSchema =
  CreateBundleActivityRequestSchema.omit({
    sessionId: true,
    sectionId: true,
    blockId: true,
  });
type CreateBundleActivityFormData = z.infer<
  typeof CreateBundleActivityFormDataSchema
>;
const CreateJamboreeActivityFormDataSchema =
  CreateJamboreeActivityRequestSchema.omit({
    sessionId: true,
    sectionId: true,
    blockId: true,
  });
type CreateJamboreeActivityFormData = z.infer<
  typeof CreateJamboreeActivityFormDataSchema
>;
const CreateActivityFormDataSchema = z.union([
  CreateJamboreeActivityFormDataSchema,
  CreateBundleActivityFormDataSchema,
]);
type CreateActivityFormData = z.infer<typeof CreateActivityFormDataSchema>;

function getCreateActivityFormDefaultValues(
  type: SchedulingSectionType,
): CreateActivityFormData {
  return type === "BUNDLE"
    ? ({
        name: "",
        description: "",
        ageGroup: "NAV",
        programAreaId: "",
      } satisfies CreateBundleActivityFormData)
    : ({
        name: "",
        description: "",
      } satisfies CreateJamboreeActivityFormData);
}

function CreateActivityModal(props: CreateActivityModalProps) {
  const { sessionId, sectionId, blockId } = props;

  const sectionScheduleQuery = useSuspenseQuery(
    sectionScheduleQueryOptions(sessionId, sectionId),
  );
  const programAreasQuery = useSuspenseInfiniteQuery(
    getUseProgramAreaListOptions(),
  );

  const createActivityMutation = useCreateActivity();

  const form = useForm({
    defaultValues: getCreateActivityFormDefaultValues(
      sectionScheduleQuery.data.type,
    ),
    validators: {
      onSubmit: CreateActivityFormDataSchema,
    },
    onSubmit: async ({ value }) => {
      createActivityMutation.mutate({
        sessionId,
        sectionId,
        blockId,
        ...value,
      });
    },
  });

  return (
    <div>
      <form.Field
        name="name"
        validators={{
          onBlur: ({ value }) => {
            const validationResult = (
              sectionScheduleQuery.data.type === "BUNDLE"
                ? CreateBundleActivityFormDataSchema
                : CreateJamboreeActivityFormDataSchema
            ).shape.name.safeParse(value);
            console.log(validationResult);
            if (validationResult.success) return;
            return validationResult.error.issues
              .map((issue) => issue.message)
              .join(", ");
          },
        }}
      >
        {(field) => (
          <TextInput
            name={field.name}
            label="Name"
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ")}
            required
          />
        )}
      </form.Field>
      <form.Field
        name="description"
        validators={{
          onBlur: ({ value }) => {
            const validationResult = (
              sectionScheduleQuery.data.type === "BUNDLE"
                ? CreateBundleActivityFormDataSchema
                : CreateJamboreeActivityFormDataSchema
            ).shape.description.safeParse(value);
            if (validationResult.success) return;
            return validationResult.error.issues
              .map((issue) => issue.message)
              .join(", ");
          },
        }}
      >
        {(field) => (
          <Textarea
            name={field.name}
            label="Description"
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ")}
            required
          />
        )}
      </form.Field>
      {sectionScheduleQuery.data.type === "BUNDLE" && (
        <>
          <form.Field name="ageGroup" validators={{
            onChange: ({ value }) => {
              const validationResult = CreateBundleActivityFormDataSchema.shape.ageGroup.safeParse(value);
              if (validationResult.success) return;
              return validationResult.error.issues
                .map((issue) => issue.message)
                .join(", ");
            }
          }}>
            {(field) => (
              <Radio.Group label="Age Group" onChange={(value: AgeGroup) => field.handleChange(value)} onBlur={field.handleBlur} required>
                {AGE_GROUPS.map((ageGroup) => (
                  <Radio value={ageGroup} label={ageGroup} />
                ))}
              </Radio.Group>
            )}
          </form.Field>
          <form.Field name="programAreaId" validators={{
            onChange: ({ value }) => {
              const validationResult = CreateBundleActivityFormDataSchema.shape.programAreaId.safeParse(value);
              if (validationResult.success) return;
              return validationResult.error.issues
                .map((issue) => issue.message)
                .join(", ");
            }
          }}>
            {(field) => (
              <Select
                label="Program Area"
                data={programAreasQuery.data.map((programArea) => ({
                  value: programArea.id,
                  label: programArea.name,
                }))}
                onChange={(value) => field.handleChange(value ?? "")}
                onBlur={field.handleBlur}
                required
              />
            )}
          </form.Field>
        </>
      )}
    </div>
  );
}

export default function openCreateActivityModal(
  props: CreateActivityModalProps,
) {
  openModal({
    title: "Create Activity",
    children: (
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <ErrorPage
            error={error instanceof Error ? error : Error("Unknown Error")}
          />
        )}
      >
        <Suspense fallback={<LoadingPage />}>
          <CreateActivityModal {...props} />
        </Suspense>
      </ErrorBoundary>
    ),
  });
}
