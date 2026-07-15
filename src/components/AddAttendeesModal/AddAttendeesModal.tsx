import { Stepper } from "@mantine/core";
import { modals } from "@mantine/modals";
import SelectAttendeesScreen from "./SelectAttendeesScreen";
import InputCamperDataScreen from "./InputCamperDataScreen";
import InputStaffDataScreen from "./InputStaffDataScreen";
import { useActiveStep } from "./AddAttendeesModalStore";
import { Suspense } from "react";
import LoadingPage from "@/app/loading";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "@/app/error";
import ConfirmationScreen from "./ConfirmationScreen";

interface AddAttendeesModalProps {
  sessionId: string;
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;
  const activeStep = useActiveStep();
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorPage error={error instanceof Error ? error : Error("Unknown Error")} />}>
      <Suspense fallback={<LoadingPage />}>
        <Stepper active={activeStep} allowNextStepsSelect={false}>
          <Stepper.Step label="Select Attendees">
            <SelectAttendeesScreen sessionId={sessionId} />
          </Stepper.Step>
          <Stepper.Step label="Input Camper Data">
            <InputCamperDataScreen />
          </Stepper.Step>
          <Stepper.Step label="Input Staff Data">
            <InputStaffDataScreen />
          </Stepper.Step>
          <Stepper.Completed>
            <ConfirmationScreen sessionId={sessionId} />
          </Stepper.Completed>
        </Stepper>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function openAddAttendeesModal(sessionId: string) {
  modals.open({
    title: "Add Attendees",
    children: <AddAttendeesModal sessionId={sessionId} />,
    size: "xl",
  });
}
