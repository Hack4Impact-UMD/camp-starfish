import {
  Button,
  Stepper,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import SelectAttendeesScreen from "./SelectAttendeesScreen";
import InputCamperDataScreen from "./InputCamperDataScreen";
import InputStaffDataScreen from "./InputStaffDataScreen";

interface AddAttendeesModalProps {
  sessionId: string;
}

const enum AddAttendeesModalScreens {
  SELECT_ATTENDEES,
  INPUT_CAMPER_DATA,
  INPUT_STAFF_DATA,
  CONFIRMATION,
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;

  const [activeStep, setActiveStep] = useState<AddAttendeesModalScreens>(
    AddAttendeesModalScreens.SELECT_ATTENDEES,
  );

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

  return (
    <div className="flex flex-col items-center w-full">
      <Stepper active={activeStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Select Attendees">
          <SelectAttendeesScreen />;
        </Stepper.Step>
        <Stepper.Step label="Input Camper Data">
          <InputCamperDataScreen />
        </Stepper.Step>
        <Stepper.Step label="Input Staff Data">
          <InputStaffDataScreen />
        </Stepper.Step>
      </Stepper>
      <div className="flex justify-around w-full">
        <Button onClick={prevStep}>Prev</Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
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
