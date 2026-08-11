import useCreateActivity from "@/features/sessions/sections/useCreateActivity";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
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

  return <div></div>;
}

export default function openCreateActivityModal(
  props: CreateActivityModalProps,
) {
  openModal({
    title: "Create Activity",
    children: <CreateActivityModal {...props} />,
  });
}
