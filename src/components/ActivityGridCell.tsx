"use client";

import { Badge, Box } from "@mantine/core";
import { ActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { isIndividualActivityAssignments } from "@/types/scheduling/schedulingTypeGuards";
import { getActivityName } from "@/types/scheduling/schedulingUtils";

interface ActivityGridCellProps {
  activity: ActivityWithAssignments;
}

export default function ActivityGridCell(props: ActivityGridCellProps) {
  const { activity } = props;

  return (
    <>
      <Box className="col-start-1 col-end-3 text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A]">
        {getActivityName(activity)}
      </Box>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? "CAMPERS" : "BUNKS"}
      </div>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? "STAFF" : "ADMIN"}
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        <ul>
          {(isIndividualActivityAssignments(activity)
            ? activity.camperIds
            : activity.bunkNums
          ).map((id) => (
            <li key={id}>
              <Badge>{id}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        <ul>
          {(isIndividualActivityAssignments(activity)
            ? [...activity.staffIds, ...activity.adminIds]
            : activity.adminIds
          ).map((id) => (
            <li key={id}>
              <Badge>{id}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
