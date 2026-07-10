import ErrorPage from "@/app/error";
import LoadingPage from "@/app/loading";
import useSession from "@/hooks/sessions/useSession";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName, isAttendeeRole } from "@/types/users/userUtils";
import {
  getObjectEntriesWithNumberKeys,
} from "@/utils/stringUtils";
import { MultiSelect, Select } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMemo, useState } from "react";

interface AddAttendeesModalProps {
  sessionId: string;
}

export function AddAttendeesModal(props: AddAttendeesModalProps) {
  const { sessionId } = props;

  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<number[]>([]);

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
      <MultiSelect
        classNames={{
          root: 'w-full',
        }}
        data={getObjectEntriesWithNumberKeys(potentialSessionAttendees).map(
          ([userId, user]) => ({
            value: userId,
            label: getFullName(user.name),
          }),
        )}
      />
      {selectedAttendeeIds.map((attendeeId) => <div>{getFullName(userDirectoryQuery.data[attendeeId].name)}</div>)}
    </div>
  );
}

export default function openAddAttendeesModal(sessionId: string) {
  modals.open({
    title: "Add Attendees",
    children: <AddAttendeesModal sessionId={sessionId} />,
  });
}
