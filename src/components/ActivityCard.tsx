"use client";

import { Box, Table, Text } from "@mantine/core";
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

// Type guards
function isIndividual(assignments: AnyAssignments): assignments is IndividualAssignments {
  return "camperIds" in assignments;
}

function isBunk(assignments: AnyAssignments): assignments is BunkAssignments {
  return "bunkNums" in assignments;
}

export function ActivityCard({ id, activity }: ActivityCardProps) {
  const theme = useMantineTheme();
  const assignments = activity.assignments;

  const headerCell = {
    fontWeight: 700,
    backgroundColor: theme.colors["neutral"][3],
    border: `1px solid ${theme.colors["neutral"][5]}`,
    padding: "6px 8px",
  };

  const bodyCell = {
    border: `1px solid ${theme.colors["neutral"][4]}`,
    padding: "6px 8px",
    fontSize: "0.9rem",
  };

  return (
    <Box
      style={{
        border: `1px solid ${theme.colors["neutral"][5]}`,
        backgroundColor: theme.colors.white,
      }}
    >
      {/* === ACTIVITY HEADER === */}
      <Box
        className="text-center font-bold"
        style={{
          backgroundColor: theme.colors["accent-yellow"],
          padding: "6px",
          borderBottom: `1px solid ${theme.colors["neutral"][5]}`,
          fontSize: "0.9rem",
          letterSpacing: "0.3px",
        }}
      >
        ACTIVITY {id}
      </Box>

      {/* === TABLE === */}
      <Table
        withTableBorder={false}
        withColumnBorders={false}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <Table.Thead>
          <Table.Tr>
            {isIndividual(assignments) && (
              <>
                <Table.Th style={headerCell}>STAFF</Table.Th>
                <Table.Th style={headerCell}>CAMPER</Table.Th>
              </>
            )}

            {isBunk(assignments) && (
              <>
                <Table.Th style={headerCell}>BUNKS</Table.Th>
                <Table.Th style={headerCell}>ADMIN</Table.Th>
              </>
            )}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {(() => {
            const maxRows = isIndividual(assignments)
              ? Math.max(assignments.staffIds.length, assignments.camperIds.length)
              : Math.max(assignments.bunkNums.length, assignments.adminIds.length);

            return Array.from({ length: maxRows }).map((_, index) => (
              <Table.Tr key={index}>
                {/* LEFT COLUMN */}
                <Table.Td style={bodyCell}>
                  {isIndividual(assignments)
                    ? assignments.staffIds[index] ?? ""
                    : assignments.bunkNums[index] ?? ""}
                </Table.Td>

                {/* RIGHT COLUMN */}
                <Table.Td style={bodyCell}>
                  {isIndividual(assignments)
                    ? assignments.camperIds[index] ?? ""
                    : assignments.adminIds[index] ?? ""}
                </Table.Td>
              </Table.Tr>
            ));
          })()}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
