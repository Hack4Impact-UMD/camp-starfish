import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import {
  useAddAttendeesModalStoreActions,
  useSelectedAttendeeIds,
} from "./AddAttendeesModalStore";
import { getUseUserDirectoryOptions } from "@/hooks/users/useUserDirectory";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { getFullName, isAttendeeRole } from "@/types/users/userUtils";
import { useMemo } from "react";
import { Button, MultiSelect } from "@mantine/core";
import { AttendeeRole } from "@/types/sessions/sessionTypes";
import { useSuspenseQueries } from "@tanstack/react-query";

export default function SelectAttendeesScreen({
  sessionId,
}: {
  sessionId: string;
}) {
  const selectedAttendeeIds = useSelectedAttendeeIds();
  const { prevStep, nextStep, selectAttendeeId, deselectAttendeeId } =
    useAddAttendeesModalStoreActions();

  const [sessionQuery, userDirectoryQuery] = useSuspenseQueries({
    queries: [
      getUseSessionOptions(sessionId),
      getUseUserDirectoryOptions()
    ]
  })

  const potentialSessionAttendees = useMemo(() => {
    return Object.fromEntries(
      getObjectEntriesWithNumberKeys(userDirectoryQuery.data).filter(
        ([userId, user]) =>
          isAttendeeRole(user.role) &&
          !sessionQuery.data.attendeeIds.includes(userId),
      ),
    );
  }, [sessionQuery.data, userDirectoryQuery.data]);

  return (
    <div className="flex flex-col gap-sm">
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
        value={selectedAttendeeIds}
        onOptionSubmit={(attendeeId) =>
          selectAttendeeId(
            attendeeId,
            userDirectoryQuery.data[attendeeId].role as AttendeeRole,
          )
        }
        onRemove={(attendeeId) =>
          deselectAttendeeId(
            attendeeId,
            userDirectoryQuery.data[attendeeId].role as AttendeeRole,
          )
        }
      />
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep} disabled>Previous</Button>
        <Button onClick={nextStep} disabled={selectedAttendeeIds.length === 0}>Next</Button>
      </div>
    </div>
  );
}
