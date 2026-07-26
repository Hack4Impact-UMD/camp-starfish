import { Button, Title } from "@mantine/core";
import {
  AdditionalCamperDataSchema,
  AdditionalStaffDataSchema,
  useAddAttendeesModalActions,
  useAdditionalCamperData,
  useAdditionalStaffData,
  useSelectedAttendeeIds,
} from "./AddAttendeesModalStore";
import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmationModalContent } from "../modals/ConfirmationModal";
import useCreateAttendees from "@/hooks/attendees/useCreateAttendees";
import {
  CreateAdminAttendeeRequest,
  CreateCamperAttendeeRequest,
  CreateStaffAttendeeRequest,
} from "@/hooks/attendees/types";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { MdCheckCircle } from "react-icons/md";

interface ConfirmationScreenProps {
  sessionId: string;
}

export default function ConfirmationScreen(props: ConfirmationScreenProps) {
  const { sessionId } = props;

  const selectedAttendeeIds = useSelectedAttendeeIds();
  const additionalCamperData = useAdditionalCamperData();
  const additionalStaffData = useAdditionalStaffData();
  const { prevStep, nextStep } = useAddAttendeesModalActions();

  const sessionQuery = useSuspenseQuery(getUseSessionOptions(sessionId));

  const createAttendeesMutation = useCreateAttendees();

  const onConfirm = () => {
    const additionalCamperDataValidationResult =
      AdditionalCamperDataSchema.safeParse(additionalCamperData);
    const additionalStaffDataValidationResult =
      AdditionalStaffDataSchema.safeParse(additionalStaffData);
    if (
      !additionalCamperDataValidationResult.success ||
      !additionalStaffDataValidationResult.success
    ) {
      throw Error("Invalid camper or staff data");
    }

    const validatedAdditionalCamperData =
      additionalCamperDataValidationResult.data;
    const validatedAdditionalStaffData =
      additionalStaffDataValidationResult.data;

    const camperIds = getObjectKeysAsNumbers(validatedAdditionalCamperData);
    const staffIds = getObjectKeysAsNumbers(validatedAdditionalStaffData);
    const adminIds = selectedAttendeeIds.filter(
      (attendeeId) =>
        !camperIds.includes(attendeeId) && !staffIds.includes(attendeeId),
    );

    const createCamperAttendeeRequests: CreateCamperAttendeeRequest[] =
      camperIds.map((camperId) => ({
        attendeeId: camperId,
        role: "CAMPER",
        ageGroup: validatedAdditionalCamperData[camperId].ageGroup,
        bunk: validatedAdditionalCamperData[camperId].bunk,
      }));
    const createStaffAttendeeRequests: CreateStaffAttendeeRequest[] =
      staffIds.map((stafferId) => ({
        attendeeId: stafferId,
        role: "STAFF",
        bunk: validatedAdditionalStaffData[stafferId].bunk,
        isLeadBunkCounselor:
          validatedAdditionalStaffData[stafferId].isLeadBunkCounselor,
      }));
    const createAdminAttendeeRequests: CreateAdminAttendeeRequest[] =
      adminIds.map((adminId) => ({
        attendeeId: adminId,
        role: "ADMIN",
      }));
    createAttendeesMutation.mutate({
      sessionId,
      attendees: [
        ...createCamperAttendeeRequests,
        ...createStaffAttendeeRequests,
        ...createAdminAttendeeRequests,
      ],
    });
  };

  if (createAttendeesMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-sm">
        <MdCheckCircle className="text-success" size={100}></MdCheckCircle>
        <Title
          order={4}
        >{`${selectedAttendeeIds.length} attendee${selectedAttendeeIds.length === 1 ? "" : "s"} added successfully!`}</Title>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-sm">
      <ConfirmationModalContent
        title={`This action will add ${selectedAttendeeIds.length} attendee${selectedAttendeeIds.length === 1 ? "" : "s"} to session "${sessionQuery.data.name}"`}
        message="WARNING: This action cannot be easily undone."
      />
      <Button
        color="aqua"
        classNames={{ root: "w-1/5" }}
        onClick={onConfirm}
        loading={createAttendeesMutation.isPending}
      >
        Confirm
      </Button>
      {createAttendeesMutation.isError && (
        <Title order={4} className="text-error">
          {createAttendeesMutation.error.message}
        </Title>
      )}
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep} disabled>
          Next
        </Button>
      </div>
    </div>
  );
}
