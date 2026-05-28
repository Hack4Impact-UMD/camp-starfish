import { modals } from "@mantine/modals";
import { Badge, Text } from "@mantine/core";
import { Role, User } from "@/types/users/userTypes";
import { ROLE_COLORS } from "./userRoles";

interface RoleChangeModalProps {
  user: User;
  newRole: Role;
  onConfirm: () => void;
}

export function openRoleChangeModal({ user, newRole, onConfirm }: RoleChangeModalProps) {
  modals.openConfirmModal({
    title: <Text fw={700}>Confirm Role Change</Text>,
    centered: true,
    size: "md",
    children: (
      <Text>
        Are you sure you want to change{" "}
        <Text component="span" fw={600}>
          {user.name.firstName} {user.name.lastName}
        </Text>
        &apos;s role from{" "}
        <Badge color={ROLE_COLORS[user.role]} variant="light">
          {user.role}
        </Badge>{" "}
        to{" "}
        <Badge color={ROLE_COLORS[newRole]} variant="light">
          {newRole}
        </Badge>
        ? This will affect what they can do in the application.
      </Text>
    ),
    labels: { confirm: "CONFIRM", cancel: "CANCEL" },
    confirmProps: { color: "blue" },
    onConfirm,
  });
}

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
        from the application? This permanently removes their user record and cannot be undone.
      </Text>
    ),
    labels: { confirm: "DELETE", cancel: "CANCEL" },
    confirmProps: { color: "error" },
    onConfirm,
  });
}
