import { useQuery } from "@tanstack/react-query";
import { getUseUserDirectoryOptions } from "../users/useUserDirectory";
import useSession from "../sessions/useSession";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";

export default function useAttendeeDirectory(sessionId: string) {
  const sessionQuery = useSession(sessionId);
  return useQuery({
    ...getUseUserDirectoryOptions(),
    select: (data) => Object.fromEntries(getObjectEntriesWithNumberKeys(data).filter(([userId, _user]) => sessionQuery.data?.attendeeIds.includes(userId)))
  });
}