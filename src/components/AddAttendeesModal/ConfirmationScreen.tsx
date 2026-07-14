import { Button, Title } from "@mantine/core";
import { useAddAttendeesModalStoreActions, useSelectedAttendeeIds } from "./AddAttendeesModalStore";
import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmationModalContent } from "../modals/ConfirmationModal";

interface ConfirmationScreenProps {
  sessionId: string;
}

export default function ConfirmationScreen(props: ConfirmationScreenProps) {
  const { sessionId } = props;
  
  const selectedAttendeeIds = useSelectedAttendeeIds();
  const { prevStep, nextStep } = useAddAttendeesModalStoreActions();

  const sessionQuery = useSuspenseQuery(getUseSessionOptions(sessionId));

  return (
    <div className="flex flex-col items-center gap-sm">
      <ConfirmationModalContent title={`This action will add ${selectedAttendeeIds.length} attendees to session "${sessionQuery.data.name}"`} message="WARNING: This action cannot be easily undone." />
      <Button color="aqua" classNames={{ root: 'w-1/5' }}>Confirm</Button>
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep} disabled>
          Next
        </Button>
      </div>
    </div>
  );
}
