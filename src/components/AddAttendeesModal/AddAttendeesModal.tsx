import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import useSession from "@/hooks/sessions/useSession";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName, isAttendeeRole } from "@/types/users/userUtils";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { MultiSelect, Stepper } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMemo, useState } from "react";

interface AddAttendeesModalProps {
  sessionId: string;
}

const enum AddAttendeesModalScreens {
  SELECT_ATTENDEES,
  FILL_IN_CAMPER_DATA,
  FILL_IN_STAFF_DATA,
  CONFIRMATION,
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;

  const [activeStep, setActiveStep] = useState<AddAttendeesModalScreens>(
    AddAttendeesModalScreens.SELECT_ATTENDEES,
  );
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<number[]>([]);

  const prevStep = () =>
    setActiveStep((activeStep) =>
      activeStep === AddAttendeesModalScreens.SELECT_ATTENDEES
        ? activeStep
        : activeStep - 1,
    );
  const nextStep = () =>
    setActiveStep((activeStep) =>
      activeStep === AddAttendeesModalScreens.CONFIRMATION
        ? activeStep
        : activeStep + 1,
    );

  const sessionQuery = useSession(sessionId);
  const userDirectoryQuery = useUserDirectory();

  const potentialSessionAttendees = useMemo(() => {
    if (!userDirectoryQuery.data || !sessionQuery.data) return {};
    return Object.fromEntries(
      getObjectEntriesWithNumberKeys(userDirectoryQuery.data || {}).filter(
        ([userId, user]) =>
          isAttendeeRole(user.role) &&
          !sessionQuery.data.attendeeIds.includes(userId),
      ),
    );
  }, [sessionQuery.data?.attendeeIds, userDirectoryQuery.data]);

  if (sessionQuery.isPending || userDirectoryQuery.isPending)
    return <LoadingPage />;
  else if (sessionQuery.isError)
    return <ErrorPage error={sessionQuery.error} />;
  else if (userDirectoryQuery.isError)
    return <ErrorPage error={userDirectoryQuery.error} />;

  return (
    <div className="flex flex-col items-center w-full">
      <Stepper active={activeStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Select attendees">
          <MultiSelect
            classNames={{
              root: "w-full",
            }}
            data={getObjectEntriesWithNumberKeys(potentialSessionAttendees).map(
              ([userId, user]) => ({
                value: userId,
                label: getFullName(user.name),
              }),
            )}
          />
        </Stepper.Step>
        <Stepper.Step label="Fill in Camper Data"></Stepper.Step>
        <Stepper.Step label="Fill in Staff Data"></Stepper.Step>
        <Stepper.Completed>Completed</Stepper.Completed>
      </Stepper>
      {selectedAttendeeIds.map((attendeeId) => (
        <div>{getFullName(userDirectoryQuery.data[attendeeId].name)}</div>
      ))}
    </div>
  );
}

export default function openAddAttendeesModal(sessionId: string) {
  modals.open({
    title: "Add Attendees",
    children: <AddAttendeesModal sessionId={sessionId} />,
    size: 'xl'
  });
}
