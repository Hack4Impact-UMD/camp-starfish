"use client";

import { Box, Table } from "@mantine/core";
import {
  IndividualAssignments,
  BunkAssignments,
  ActivityWithAssignments,
} from "@/types/sessionTypes";
import { isBunkAssignments, isIndividualAssignments } from "@/features/scheduling/generation/schedulingUtils";

type ActivityAssignments = IndividualAssignments | BunkAssignments;

interface ActivityCardProps {
  activity: ActivityWithAssignments
}

export function ActivityCard(props: ActivityCardProps) {
  const { activity } = props;
  const assignments = activity.assignments;

  const maxRows = isIndividualAssignments(assignments)
    ? Math.max(assignments.staffIds.length, assignments.camperIds.length)
    : Math.max(assignments.bunkNums.length, assignments.adminIds.length);

  return (
    <Box>
      {/* === CARD HEADER === */}
      <Box
        className="text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A]"
      >
        {activity.name}
      </Box>

      {/* === TABLE WRAPPER === */}
      <Box style={{ maxHeight: 5 * 36, overflowY: "auto" }}>
        <Table
          withTableBorder
          withColumnBorders
          className="w-full border border-[#001B2A] border-collapse [&_*]:border-[#001B2A]"
        >
          {/* HEADER */}
          <Table.Thead
            className="bg-[#ECECEC] sticky top-0 z-20"
          >
            <Table.Tr>
              {isIndividualAssignments(assignments) && (
                <>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    STAFF
                  </Table.Th>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    CAMPER
                  </Table.Th>
                </>
              )}

              {isBunkAssignments(assignments) && (
                <>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    BUNKS
                  </Table.Th>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    ADMIN
                  </Table.Th>
                </>
              )}
            </Table.Tr>
          </Table.Thead>

          {/* BODY ROWS */}
          <Table.Tbody>
            {Array.from({ length: maxRows }).map((_, index) => (
              <Table.Tr key={index}>
                <Table.Td className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
                  {isIndividualAssignments(assignments)
                    ? assignments.staffIds[index] ?? ""
                    : assignments.bunkNums[index] ?? ""}
                </Table.Td>

                <Table.Td className="px-2 py-2 text-[0.9rem] text-center border border-[#001B2A]">
                  {isIndividualAssignments(assignments)
                    ? assignments.camperIds[index] ?? ""
                    : assignments.adminIds[index] ?? ""}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
}
