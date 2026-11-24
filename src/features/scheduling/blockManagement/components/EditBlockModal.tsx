import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import { UUIDV4 } from "@/types/utils/idTypes";
import { asTimeOnlyMoment, hoursMinutesRegex } from "@/utils/timeUtils";
import { Button, Text } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { modals, openModal } from "@mantine/modals";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import moment from "moment";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import z from "zod";
import useCreateBlock from "../hooks/useCreateBlock";
import useUpdateBlock from "../hooks/useUpdateBlock";

type EditBlockModalProps =
  | {
      sessionId: string;
      sectionId: string;
      mode: "CREATE";
      blockId?: never;
    }
  | {
      sessionId: string;
      sectionId: string;
      mode: "UPDATE";
      blockId: UUIDV4;
    };

const EditBlockFormSchema = z
  .object({
    startTime: z
      .string()
      .regex(hoursMinutesRegex, "Invalid time")
      .transform((val: string) => asTimeOnlyMoment(moment(val, "HH:mm"))),
    endTime: z
      .string()
      .regex(hoursMinutesRegex, "Invalid time")
      .transform((val: string) => asTimeOnlyMoment(moment(val, "HH:mm"))),
  })
  .refine((obj) => obj.endTime.isAfter(obj.startTime), {
    error: "End time must be after start time",
  });

function EditBlockModal(props: EditBlockModalProps) {
  const { sessionId, sectionId, mode, blockId } = props;

  const sectionScheduleQuery = useSuspenseQuery(
    sectionScheduleQueryOptions(sessionId, sectionId),
  );

  const createBlockMutation = useCreateBlock();
  const updateBlockMutation = useUpdateBlock();

  const closeModal = () => modals.close(editBlockModalId(props));

  const form = useForm({
    defaultValues: {
      startTime:
        mode === "CREATE"
          ? ""
          : sectionScheduleQuery.data.blocks[blockId].startTime.format("HH:mm"),
      endTime:
        mode === "CREATE"
          ? ""
          : sectionScheduleQuery.data.blocks[blockId].endTime.format("HH:mm"),
    },
    validators: {
      onChange: ({ formApi, value }) => {
        if (
          !formApi.getFieldMeta("startTime")?.isValid ||
          !formApi.getFieldMeta("endTime")?.isValid
        ) {
          return;
        }
        return asTimeOnlyMoment(moment(value.startTime, "HH:mm")).isBefore(
          asTimeOnlyMoment(moment(value.endTime, "HH:mm")),
        )
          ? ""
          : "End time must be after start time";
      },
      onSubmit: EditBlockFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const valResult = EditBlockFormSchema.safeParse(value);
      if (!valResult.success) {
        return {
          onSubmit: {
            fields: {},
            form: valResult.error.issues
              .flatMap((issue) => issue.message)
              .join(", "),
          },
        };
      }
      const { startTime, endTime } = valResult.data;
      try {
        if (mode === "CREATE") {
          await createBlockMutation.mutateAsync(
            {
              sessionId,
              sectionId,
              startTime,
              endTime,
            },
            { onSuccess: closeModal },
          );
        } else if (mode === "UPDATE") {
          await updateBlockMutation.mutateAsync(
            {
              sessionId,
              sectionId,
              blockId,
              startTime: formApi.getFieldMeta("startTime")?.isDefaultValue
                ? undefined
                : startTime,
              endTime: formApi.getFieldMeta("endTime")?.isDefaultValue
                ? undefined
                : endTime,
            },
            { onSuccess: closeModal },
          );
        }
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            fields: {},
            form: error instanceof Error ? error.message : "An unexpected error occurred."
          }
        })
      }
    },
  });

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full p-sm gap-sm">
        <form.Field
          name="startTime"
          key="startTime"
          validators={{
            onBlur: EditBlockFormSchema.shape.startTime,
            onMount: EditBlockFormSchema.shape.endTime,
          }}
          listeners={{
            onChange: ({ fieldApi }) =>
              fieldApi.setErrorMap({ onBlur: undefined }),
          }}
        >
          {(field) => (
            <TimeInput
              classNames={{ root: "grow max-w-1/2" }}
              name={field.name}
              label="Start Time"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errorMap.onBlur
                ?.map((err) => err?.message)
                .join(", ")}
              required
            />
          )}
        </form.Field>
        <Text className="h-full text-xl self-center pt-lg">-</Text>
        <form.Field
          name="endTime"
          key="endTime"
          validators={{
            onBlur: EditBlockFormSchema.shape.endTime,
            onMount: EditBlockFormSchema.shape.endTime,
          }}
          listeners={{
            onChange: ({ fieldApi }) =>
              fieldApi.setErrorMap({ onBlur: undefined }),
          }}
        >
          {(field) => (
            <TimeInput
              classNames={{ root: "grow max-w-1/2", error: "text-wrap" }}
              name={field.name}
              label="End Time"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errorMap.onBlur
                ?.map((err) => err?.message)
                .join(", ")}
              required
            />
          )}
        </form.Field>
      </div>
      <form.Subscribe selector={(state) => state.errorMap}>
        {(errorMap) => (
          <Text className="self-center text-error">
            {errorMap.onChange ?? (typeof errorMap.onSubmit === "string" ? errorMap.onSubmit : "An unexpected error occurred.")}
          </Text>
        )}
      </form.Subscribe>
      <div className="flex flex-row justify-center w-full gap-xl">
        <Button variant="light" onClick={closeModal}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              color="green"
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              onClick={form.handleSubmit}
            >
              {mode === "CREATE" ? "Create" : "Save"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}

function editBlockModalId(props: EditBlockModalProps) {
  return `edit-block-modal-${props.sessionId}-${props.sectionId}-${props.blockId}`;
}

export default function openEditBlockModal(props: EditBlockModalProps) {
  openModal({
    title: props.mode === "CREATE" ? "Create Block" : "Edit Block",
    modalId: editBlockModalId(props),
    children: (
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <ErrorPage
            error={error instanceof Error ? error : new Error("Unknown Error")}
          />
        )}
      >
        <Suspense fallback={<LoadingPage />}>
          <EditBlockModal {...props} />
        </Suspense>
      </ErrorBoundary>
    ),
  });
}
