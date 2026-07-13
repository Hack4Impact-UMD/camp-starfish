import { Stepper } from "@mantine/core";
import { modals } from "@mantine/modals";
import SelectAttendeesScreen from "./SelectAttendeesScreen";
import InputCamperDataScreen from "./InputCamperDataScreen";
import InputStaffDataScreen from "./InputStaffDataScreen";
import { useActiveStep } from "./AddAttendeesModalStore";

interface AddAttendeesModalProps {
  sessionId: string;
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;

  const activeStep = useActiveStep();

  return (
    <div className="flex flex-col items-center w-full">
      <Stepper active={activeStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Select Attendees">
          <SelectAttendeesScreen sessionId={sessionId}/>
        </Stepper.Step>
        <Stepper.Step label="Input Camper Data">
          <InputCamperDataScreen />
        </Stepper.Step>
        <Stepper.Step label="Input Staff Data">
          <InputStaffDataScreen />
        </Stepper.Step>
      </Stepper>
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
