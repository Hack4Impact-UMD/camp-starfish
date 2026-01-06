"use client";

import { Box, Table } from "@mantine/core";
import {
  IndividualAssignments,
  BunkAssignments,
  ActivityWithAssignments,
} from "@/types/sessionTypes";
import {
  isBunkAssignments,
  isIndividualAssignments,
} from "@/features/scheduling/generation/schedulingUtils";

type ActivityAssignments = IndividualAssignments | BunkAssignments;

interface ActivityCardProps {
  activity: ActivityWithAssignments;
}

export function ActivityCard(props: ActivityCardProps) {
  const { activity } = props;
  const assignments = activity.assignments;

  const maxRows = isIndividualAssignments(assignments)
    ? Math.max(assignments.staffIds.length, assignments.camperIds.length)
    : Math.max(assignments.bunkNums.length, assignments.adminIds.length);

  return (
    <>
      <Box className="col-start-1 col-end-3 text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A]">
        {activity.name}
      </Box>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualAssignments(assignments) ? "CAMPERS" : "BUNKS"}
      </div>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualAssignments(assignments) ? "STAFF" : "ADMIN"}
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        <ul>
          {(isIndividualAssignments(assignments)
            ? assignments.camperIds
            : assignments.bunkNums
          ).map((id) => (
            <li>{id}</li>
          ))}
        </ul>
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        <ul>
          {(isIndividualAssignments(assignments)
            ? [...assignments.staffIds, ...assignments.adminIds]
            : assignments.adminIds
          ).map((id) => (
            <li>{id}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
