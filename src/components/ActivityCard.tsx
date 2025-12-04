"use client";

import { Box, Table } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import {
  IndividualAssignments,
  BunkAssignments,
  AttendeeID
} from "@/types/sessionTypes";

import useAttendeesById from "@/hooks/attendees/useAttendeesById";

import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";

type AnyAssignments = IndividualAssignments | BunkAssignments;



function isIndividual(
  assignments: AnyAssignments
): assignments is IndividualAssignments {
  return "camperIds" in assignments;
}

function isBunk(assignments: AnyAssignments): assignments is BunkAssignments {
  return "bunkNums" in assignments;
}interface ActivityCardProps {
  id: number;
  activity: {
    name: string;
    description: string;
    assignments: AnyAssignments;
  };
  isGenerated: boolean;
}
interface SessionRouteParams extends Params {
  sessionId: string;
}
export function ActivityCard({ id, activity, isGenerated }: ActivityCardProps) {
  const { sessionId } = useParams<SessionRouteParams>();
  
  const assignments = activity.assignments;

  const maxRows = isIndividual(assignments)
    ? Math.max(assignments.staffIds.length, assignments.camperIds.length)
    : Math.max(assignments.bunkNums.length, assignments.adminIds.length);
  


  const { data: staff } = useAttendeesById(
    sessionId,
    isIndividual(assignments) ? assignments.staffIds : [],
    "staff"
  );

  const { data: campers } = useAttendeesById(
    sessionId,
    isIndividual(assignments) ? assignments.camperIds : [],
    "campers"
  );


  return (
    <Box>
      {/* HEADER */}
      <Box
        className="text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A]"
      >
        {activity.name}
      </Box>

      {/* TABLE */}
      <Box style={{ maxHeight: 5 * 36, overflowY: "auto" }}>
        <Table
          withTableBorder
          withColumnBorders
          className="w-full border border-[#001B2A] border-collapse [&_*]:border-[#001B2A]"
        >
          <Table.Thead className="bg-[#ECECEC] sticky top-0 z-20">
            <Table.Tr>
              {isIndividual(assignments) ? (
                <>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center">
                    STAFF
                  </Table.Th>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center">
                    CAMPER
                  </Table.Th>
                </>
              ) : (
                <>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center">
                    BUNKS
                  </Table.Th>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center">
                    ADMIN
                  </Table.Th>
                </>
              )}
            </Table.Tr>
          </Table.Thead>

          {isGenerated ? (
            <Table.Tbody>
              {Array.from({ length: maxRows }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="px-2 py-1 text-center">
                    {isIndividual(assignments) ? staff?.[index] ?? "Loading..." : ""}
                  </Table.Td>
                  <Table.Td className="px-2 py-1 text-center">
                    {isIndividual(assignments) ? campers?.[index] ?? "Loading..." : ""}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          ) : (
            <Table.Tbody>
              <Table.Tr>
                <Table.Td colSpan={2} className="bg-white p-2 text-center">

                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          )}

        </Table>
      </Box>
    </Box>
  );
}
