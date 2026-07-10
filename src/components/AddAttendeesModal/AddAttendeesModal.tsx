import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import useSession from "@/hooks/sessions/useSession";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { Select } from "@mantine/core";
import { modals } from "@mantine/modals";

interface AddAttendeesModalProps {
  sessionId: string;
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;

  const sessionQuery = useSession(sessionId);
  const userDirectoryQuery = useUserDirectory();

  if (sessionQuery.isPending || userDirectoryQuery.isPending)
    return <LoadingPage />;
  else if (sessionQuery.isError || userDirectoryQuery.isError)
    return <ErrorPage error={sessionQuery.error || userDirectoryQuery.error} />;

  return <div>
    <Select data={Object.entries(userDirectoryQuery.data || {}).map(([userId, user]) => ({ value: userId, label: getFullName(user.name) }))}>

    </Select>
  </div>;
}

export default function openAddAttendeesModal(sessionId: string) {
  modals.open({
    title: "Add Attendees",
    children: <AddAttendeesModal sessionId={sessionId} />,
  });
}
