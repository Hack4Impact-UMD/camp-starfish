import useSession from "@/hooks/sessions/useSession";
import {
  useAddAttendeesModalStoreActions,
  useSelectedAttendeeIds,
} from "./AddAttendeesModalStore";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { getFullName, isAttendeeRole } from "@/types/users/userUtils";
import { useMemo } from "react";
import { MultiSelect } from "@mantine/core";

export default function SelectAttendeesScreen() {
  const selectedAttendeeIds = useSelectedAttendeeIds();
  const { selectAttendeeId, deselectAttendeeId } = useAddAttendeesModalStoreActions();

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

  return (
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
      onOptionSubmit={(attendeeId) => selectAttendeeId(attendeeId, userDirectoryQuery.data?[attendeeId].role)}
      onRemove={(attendeeId) => deselectAttendeeId(attendeeId, userDirectoryQuery.data[attendeeId].role)}
    />
  );
}
