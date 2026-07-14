import { Button, Title } from "@mantine/core";
import { useAddAttendeesModalStoreActions, useAdditionalCamperData, useAdditionalStaffData, useSelectedAttendeeIds } from "./AddAttendeesModalStore";
import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmationModalContent } from "../modals/ConfirmationModal";
import useCreateAttendees, { CreateAdminAttendeeRequest, CreateCamperAttendeeRequest, CreateStaffAttendeeRequest } from "@/hooks/attendees/useCreateAttendees";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";

interface ConfirmationScreenProps {
  sessionId: string;
}

export default function ConfirmationScreen(props: ConfirmationScreenProps) {
  const { sessionId } = props;
  
  const selectedAttendeeIds = useSelectedAttendeeIds();
  const additionalCamperData = useAdditionalCamperData();
  const additionalStaffData = useAdditionalStaffData();
  const { prevStep, nextStep } = useAddAttendeesModalStoreActions();

  const sessionQuery = useSuspenseQuery(getUseSessionOptions(sessionId));

  const createAttendeesMutation = useCreateAttendees();

  const onConfirm = () => {
    const camperIds = getObjectKeysAsNumbers(additionalCamperData);
    const staffIds = getObjectKeysAsNumbers(additionalStaffData);
    const adminIds = selectedAttendeeIds.filter(attendeeId => !camperIds.includes(attendeeId) && !staffIds.includes(attendeeId));

    const createCamperAttendeeRequests: CreateCamperAttendeeRequest[] = camperIds.map(camperId => ({
      attendeeId: camperId,
      role: "CAMPER",
      ageGroup: additionalCamperData[camperId].ageGroup,
      bunk: additionalCamperData[camperId].bunk
    }));
    const createStaffAttendeeRequests: CreateStaffAttendeeRequest[] = staffIds.map(stafferId => ({
      attendeeId: stafferId,
      role: "STAFF",
      bunk: additionalStaffData[stafferId].bunk,
      isLeadBunkCounselor: additionalStaffData[stafferId].isLeadBunkCounselor
    }));
    const createAdminAttendeeRequests: CreateAdminAttendeeRequest[] = adminIds.map(adminId => ({
      attendeeId: adminId,
      role: "ADMIN"
    }));
    createAttendeesMutation.mutate({
      sessionId,
      attendees: [...createCamperAttendeeRequests, ...createStaffAttendeeRequests, ...createAdminAttendeeRequests]
    })
  }

  return (
    <div className="flex flex-col items-center gap-sm">
      <ConfirmationModalContent title={`This action will add ${selectedAttendeeIds.length} attendees to session "${sessionQuery.data.name}"`} message="WARNING: This action cannot be easily undone." />
      <Button color="aqua" classNames={{ root: 'w-1/5' }} onClick={onConfirm}>Confirm</Button>
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep} disabled>
          Next
        </Button>
      </div>
    </div>
  );
}
