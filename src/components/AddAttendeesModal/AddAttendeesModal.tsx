import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import useSession from "@/hooks/sessions/useSession";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import { getFullName, isAttendeeRole } from "@/types/users/userUtils";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import {
  Button,
  MultiSelect,
  NumberInput,
  Select,
  Stepper,
  Table,
  TableTbody,
} from "@mantine/core";
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

  const camperIds = selectedAttendeeIds.filter(
    (attendeeId) => userDirectoryQuery.data[attendeeId].role === "CAMPER",
  );
  const staffIds = selectedAttendeeIds.filter(
    (attendeeId) => userDirectoryQuery.data[attendeeId].role === "STAFF",
  );

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
            onChange={(attendeeIds) => setSelectedAttendeeIds(attendeeIds)}
          />
        </Stepper.Step>
        <Stepper.Step label="Fill in Camper Data">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Age Group</Table.Th>
                <Table.Th>Bunk</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {camperIds.map((camperId) => {
                const camperDirectoryEntry = userDirectoryQuery.data[camperId];
                return (
                <Table.Tr>
                  <Table.Td>{camperId}</Table.Td>
                  <Table.Td>{getFullName(camperDirectoryEntry.name)}</Table.Td>
                  <Table.Td><Select data={AGE_GROUPS}/></Table.Td>
                  <Table.Td><NumberInput/></Table.Td>
                </Table.Tr>
              )})}
            </Table.Tbody>
          </Table>
        </Stepper.Step>
        <Stepper.Step label="Fill in Staff Data"></Stepper.Step>
        <Stepper.Completed>Completed</Stepper.Completed>
      </Stepper>
      <Button onClick={nextStep}></Button>
    </div>
  );
}

export default function openAddAttendeesModal(sessionId: string) {
  modals.open({
    title: "Add Attendees",
    children: <AddAttendeesModal sessionId={sessionId} />,
    size: "xl",
  });
}
