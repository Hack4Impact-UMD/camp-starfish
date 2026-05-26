import { modals } from "@mantine/modals";
import { Title, Text } from "@mantine/core";
import { MdWarningAmber } from "react-icons/md";

interface ConfirmationModalProps {
  title?: string;
  message?: string;
  onConfirm: (() => void) | (() => Promise<void>);
  loading?: boolean;
  disabled?: boolean;
}

type ConfirmationModalContentProps = Required<Pick<ConfirmationModalProps, "title" | "message">>;

export function ConfirmationModalContent(props: ConfirmationModalContentProps) {
  const { title, message } = props;
  return (
    <div className="flex flex-col justify-center items-center gap-md">
      <Title order={4} className="text-center">{title}</Title>
      <div className="flex flex-row items-center justify-betweengap-xs">
        <MdWarningAmber className="min-w-1/10 text-warning" size={24} />
        <Text className="text-neutral">{message}</Text>
      </div>
    </div>
  );
}

export default function openConfirmationModal(props: ConfirmationModalProps) {
  const {
    title = "Are you sure you want to perform this action?",
    message = "WARNING: This action cannot be undone.",
    onConfirm,
    loading = false,
    disabled = false,
  } = props;
  modals.openConfirmModal({
    children: <ConfirmationModalContent title={title} message={message} />,
    classNames: {
        content: 'p-lg rounded-sm'
    },
    labels: {
      confirm: "Confirm",
      cancel: "Cancel",
    },
    onConfirm,
    confirmProps: { color: "error", loading, disabled },
    cancelProps: { color: "gray", disabled },
    groupProps: { className: "flex flex-row justify-center" },
    withCloseButton: false,
    closeOnConfirm: true,
    closeOnCancel: true,
  });
}
