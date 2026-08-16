import useCreateActivity, {
  CreateBundleActivityRequestSchema,
  CreateJamboreeActivityRequestSchema,
} from "@/features/sessions/sections/useCreateActivity";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import {
  AGE_GROUPS,
  AgeGroup,
} from "@/types/sessions/sessionTypes";
import { Button, Radio, Select, Textarea, TextInput } from "@mantine/core";
import { modals, openModal } from "@mantine/modals";
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

const CreateJamboreeActivityFormDataSchema =
  CreateJamboreeActivityRequestSchema.omit({
    sessionId: true,
    sectionId: true,
    blockId: true,
  });

const CreateActivityFormDataSchema = z.union([
  CreateJamboreeActivityFormDataSchema,
  CreateBundleActivityFormDataSchema,
]);

function CreateActivityModal(props: CreateActivityModalProps) {
  const { sessionId, sectionId, blockId } = props;

  const sectionScheduleQuery = useSuspenseQuery(
    sectionScheduleQueryOptions(sessionId, sectionId),
  );
  const programAreasQuery = useSuspenseInfiniteQuery(
    getUseProgramAreaListOptions({
      where: [{ fieldPath: "isDeleted", operation: "==", value: false }],
    }),
  );

  const createActivityMutation = useCreateActivity();

  const validationSchema = sectionScheduleQuery.data.type === "BUNDLE"
    ? CreateBundleActivityRequestSchema
    : CreateJamboreeActivityRequestSchema;

  const form = useForm({
    defaultValues:
      sectionScheduleQuery.data.type === "BUNDLE"
        ? {
            name: "",
            description: "",
            ageGroup: "NAV" as AgeGroup,
            programAreaId: null as string | null,
          }
        : {
            name: "",
            description: "",
          },
    validators: {
      onSubmit: CreateActivityFormDataSchema,
    },
    onSubmit: async ({ value }) => {
      const validationResult = CreateActivityFormDataSchema.safeParse(value);
      if (!validationResult.success) {
        return;
      }
      await createActivityMutation.mutateAsync(
        {
          sessionId,
          sectionId,
          blockId,
          ...validationResult.data,
        },
        {
          onSuccess: () => modals.close(createActivityModalId(props)),
        },
      );
    },
  });

  return (
    <div className="flex flex-col gap-sm">
      <form.Field
        name="name"
        key="name"
        validators={{
          onBlur: ({ value }) => {
            const validationResult = validationSchema.shape.name.safeParse(value);
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
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ")}
            required
          />
        )}
      </form.Field>
      <form.Field
        name="description"
        key="description"
        validators={{
          onBlur: ({ value }) => {
            const validationResult = validationSchema.shape.description.safeParse(value);
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
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ")}
            required
          />
        )}
      </form.Field>
      {sectionScheduleQuery.data.type === "BUNDLE" && (
        <>
          <form.Field name="ageGroup" key="ageGroup">
            {(field) => (
              <Radio.Group
                label="Age Group"
                value={field.state.value}
                onChange={(value: AgeGroup) => field.handleChange(value)}
                onBlur={field.handleBlur}
                required
              >
                <div className="flex flex-col gap-xs">
                  {AGE_GROUPS.map((ageGroup) => (
                    <Radio value={ageGroup} label={ageGroup} />
                  ))}
                </div>
              </Radio.Group>
            )}
          </form.Field>
          <form.Field
            name="programAreaId"
            key="programAreaId"
            validators={{
              onSubmit: ({ value }) => {
                const validationResult =
                  CreateBundleActivityFormDataSchema.shape.programAreaId.safeParse(
                    value,
                  );
                if (validationResult.success) return;
                return validationResult.error.issues
                  .map((issue) => issue.message)
                  .join(", ");
              },
            }}
          >
            {(field) => (
              <Select
                label="Program Area"
                data={programAreasQuery.data.map((programArea) => ({
                  value: programArea.id,
                  label: `${programArea.id}: ${programArea.name}`,
                }))}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ")}
                required
              />
            )}
          </form.Field>
        </>
      )}
      <Button
        color="green"
        onClick={form.handleSubmit}
        loading={form.state.isSubmitting}
      >
        Submit
      </Button>
    </div>
  );
}

function createActivityModalId(props: CreateActivityModalProps) {
  return `create-activity-modal-${props.sessionId}-${props.sectionId}-${props.blockId}`;
}

export default function openCreateActivityModal(
  props: CreateActivityModalProps,
) {
  openModal({
    title: "Create Activity",
    modalId: createActivityModalId(props),
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
