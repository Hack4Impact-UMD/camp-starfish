import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import {
  useAddAttendeesModalActions,
  useSelectedAttendeeIds,
} from "./AddAttendeesModalStore";
import { getUsePersonDirectoryOptions } from "@/hooks/people/usePersonDirectory";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { getFullName, isAttendeeRole } from "@/types/people/personUtils";
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
    useAddAttendeesModalActions();

  const [sessionQuery, personDirectoryQuery] = useSuspenseQueries({
    queries: [getUseSessionOptions(sessionId), getUsePersonDirectoryOptions()],
  });

  const potentialSessionAttendees = useMemo(() => {
    return Object.fromEntries(
      getObjectEntriesWithNumberKeys(personDirectoryQuery.data).filter(
        ([personId, person]) =>
          isAttendeeRole(person.role) &&
          !sessionQuery.data.attendeeIds.includes(personId),
      ),
    );
  }, [sessionQuery.data, personDirectoryQuery.data]);

  return (
    <div className="flex flex-col gap-sm">
      <MultiSelect
        classNames={{
          root: "w-full",
        }}
        data={getObjectEntriesWithNumberKeys(potentialSessionAttendees).map(
          ([personId, person]) => ({
            value: personId,
            label: getFullName(person.name),
          }),
        )}
        value={selectedAttendeeIds}
        onOptionSubmit={(attendeeId) =>
          selectAttendeeId(
            attendeeId,
            personDirectoryQuery.data[attendeeId].role as AttendeeRole,
          )
        }
        onRemove={(attendeeId) =>
          deselectAttendeeId(
            attendeeId,
            personDirectoryQuery.data[attendeeId].role as AttendeeRole,
          )
        }
      />
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep} disabled>
          Previous
        </Button>
        <Button onClick={nextStep} disabled={selectedAttendeeIds.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}
