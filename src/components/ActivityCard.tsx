"use client";

import { Box, Table } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import {
  IndividualAssignments,
  BunkAssignments,
} from "@/types/sessionTypes";

type AnyAssignments = IndividualAssignments | BunkAssignments;

interface ActivityCardProps {
  id: number;
  activity: {
    name: string;
    description: string;
    assignments: AnyAssignments;
  };
}

function isIndividual(
  assignments: AnyAssignments
): assignments is IndividualAssignments {
  return "camperIds" in assignments;
}

function isBunk(assignments: AnyAssignments): assignments is BunkAssignments {
  return "bunkNums" in assignments;
}

export function ActivityCard({ id, activity }: ActivityCardProps) {
  const assignments = activity.assignments;

  const maxRows = isIndividual(assignments)
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
              {isIndividual(assignments) && (
                <>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    STAFF
                  </Table.Th>
                  <Table.Th className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
                    CAMPER
                  </Table.Th>
                </>
              )}

              {isBunk(assignments) && (
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
                  {isIndividual(assignments)
                    ? assignments.staffIds[index] ?? ""
                    : assignments.bunkNums[index] ?? ""}
                </Table.Td>

                <Table.Td className="px-2 py-2 text-[0.9rem] text-center border border-[#001B2A]">
                  {isIndividual(assignments)
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
