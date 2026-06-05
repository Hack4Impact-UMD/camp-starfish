import { modals } from "@mantine/modals";
import openConfirmationModal from "./modals/ConfirmationModal";
import { User } from "@/types/users/userTypes";
import { getFullName } from "@/types/users/userUtils";
import useDeleteUser from "@/hooks/users/useDeleteUser";

interface DeleteUserConfirmationModalProps {
  user: User;
}

export default function openDeleteUserConfirmationModal(props: DeleteUserConfirmationModalProps) {
  const { user } = props;
  const deleteUserMutation = useDeleteUser();
  openConfirmationModal({
    title: `Delete User "${getFullName(user.name)}"?`,
    onConfirm: () => deleteUserMutation.mutate({ userId: user.id })
  })
}