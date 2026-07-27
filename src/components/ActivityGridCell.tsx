"use client";

import { Box } from "@mantine/core";
import { ActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { Attendee, SchedulingSection } from "@/types/sessions/sessionTypes";
import { isIndividualActivityAssignments } from "@/types/scheduling/schedulingTypeGuards";
import { getActivityName } from "@/types/scheduling/schedulingUtils";
import { getFullName } from "@/types/users/userUtils";
import {
  AttendeeGroups,
} from "@/features/scheduling/generation/schedulingUtils";
import { openActivityModal } from "@/components/ActivityModal";
import useAttendeeDirectory from "@/hooks/attendees/useAttendeeDirectory";
import LoadingPage from "@/app/loading";

interface ActivityGridCellProps {
  activity: ActivityWithAssignments;
  blockId: string;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
}

interface BunkRosterProps {
  bunkNums: number[];
  attendeesByBunk: Record<number, Attendee[]>;
}

function BunkRoster(props: BunkRosterProps) {
  const { bunkNums, attendeesByBunk } = props;
  return (
    <>
      {bunkNums.map((bunkNum) => (
        <div key={bunkNum}>
          <p className="font-semibold">Bunk {bunkNum}</p>
          <ul>
            {(attendeesByBunk[bunkNum] ?? []).map((attendee) => (
              <li key={attendee.attendeeId}>
                {getFullName(attendee.snapshot.name)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export default function ActivityGridCell(props: ActivityGridCellProps) {
  const { activity, blockId, section, attendeeGroups } = props;
  const { campers, staff, admins, campersByBunk, staffByBunk } =
    attendeeGroups;

  const attendeeDirectoryQuery = useAttendeeDirectory(section.sessionId);

  if (!attendeeDirectoryQuery.data) {
    return <LoadingPage />;
  }

  return (
    <>
      <Box
        className="col-start-1 col-end-3 text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A] cursor-pointer"
        onClick={() =>
          openActivityModal({
            section,
            blockId,
            activity,
            campers,
            staff,
            admins,
          })
        }
      >
        {getActivityName(activity)}
      </Box>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? "CAMPERS" : "BUNKS"}
      </div>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        STAFF
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? (
          <ul>
            {activity.camperIds.map((camperId) => (
              <li key={camperId}>{getFullName(attendeeDirectoryQuery.data[camperId].name)}</li>
            ))}
          </ul>
        ) : (
          <BunkRoster
            bunkNums={activity.bunkNums}
            attendeesByBunk={campersByBunk}
          />
        )}
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? (
          <ul>
            {activity.staffIds.map((staffId) => (
              <li key={staffId}>{getFullName(attendeeDirectoryQuery.data[staffId].name)}</li>
            ))}
            {activity.adminIds.map((adminId) => (
              <li key={adminId} className="font-bold">
                {getFullName(attendeeDirectoryQuery.data[adminId].name)}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <BunkRoster
              bunkNums={activity.bunkNums}
              attendeesByBunk={staffByBunk}
            />
            <ul>
              {activity.adminIds.map((adminId) => (
                <li key={adminId} className="font-bold">
                  {getFullName(attendeeDirectoryQuery.data[adminId].name)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
