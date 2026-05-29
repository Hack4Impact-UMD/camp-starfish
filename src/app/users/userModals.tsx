import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import { User } from "@/types/users/userTypes";

interface DeleteUserModalProps {
  user: User;
  onConfirm: () => void;
}

export function openDeleteUserModal({ user, onConfirm }: DeleteUserModalProps) {
  modals.openConfirmModal({
    title: (
      <Text fw={700} c="error">
        WARNING! Permanent Action
      </Text>
    ),
    centered: true,
    size: "md",
    children: (
      <Text>
        Are you sure you want to delete{" "}
        <Text component="span" fw={600}>
          {user.name.firstName} {user.name.lastName}
        </Text>{" "}
        from the application? This permanently removes their account and revokes their access, and cannot be undone.
      </Text>
    ),
    labels: { confirm: "DELETE", cancel: "CANCEL" },
    confirmProps: { color: "error" },
    onConfirm,
  });
}
