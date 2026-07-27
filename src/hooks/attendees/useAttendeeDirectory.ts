import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { getUseUserDirectoryOptions } from "../users/useUserDirectory";
import { getUseSessionOptions } from "../sessions/useSession";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { UserDirectory } from "@/types/albums/albumTypes";
import { Session } from "@/types/sessions/sessionTypes";

function combine(queries: [UseQueryResult<Omit<UserDirectory, "page">>, UseQueryResult<Session>]) {
  const [userDirectoryQuery, sessionQuery] = queries;
  return {
    isPending: userDirectoryQuery.isPending || sessionQuery.isPending,
    isError: userDirectoryQuery.isError || sessionQuery.isError,
    isSuccess: userDirectoryQuery.isSuccess && sessionQuery.isSuccess,
    data: userDirectoryQuery.isSuccess && sessionQuery.isSuccess ? Object.fromEntries(getObjectEntriesWithNumberKeys(userDirectoryQuery.data).filter(([userId, _user]) => sessionQuery.data?.attendeeIds.includes(userId))) : {}
  }
}

export default function useAttendeeDirectory(sessionId: string) {
  return useQueries({
    queries: [getUseUserDirectoryOptions(), getUseSessionOptions(sessionId)],
    combine
  })
}