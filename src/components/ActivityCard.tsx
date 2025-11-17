import { IndividualAssignments, BunkAssignments } from "@/types/sessionTypes";
import { Box, Table, Text } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";

type AnyAssignments = IndividualAssignments | BunkAssignments;

interface ActivityCardProps {
  id: number;
  activity: {
    name: string;
    description: string;
    assignments: AnyAssignments;
  };
}

// Type guard functions
function isIndividualAssignments(
  assignments: AnyAssignments
): assignments is IndividualAssignments {
  return "camperIds" in assignments && "staffIds" in assignments;
}

function isBunkAssignments(
  assignments: AnyAssignments
): assignments is BunkAssignments {
  return "bunkNums" in assignments && !("camperIds" in assignments);
}

export function ActivityCard({ id, activity }: ActivityCardProps) {
  const theme = useMantineTheme();
  const assignments = activity.assignments;

  return (
    <Box
      style={{
        border: `1px solid ${theme.colors["neutral"][5]}`,
      }}
    >
      <Box
        className="text-center font-bold p-1 w-full"
        style={{
          backgroundColor: theme.colors["accent-yellow"][1],
          borderBottom: `1px solid ${theme.colors["neutral"][5]}`,
        }}
      >
        ACTIVITY {id}
      </Box>

      {isIndividualAssignments(assignments) ? (
        <Table withTableBorder={false} withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ fontWeight: "bold", textAlign: "left", backgroundColor: theme.colors["neutral"][3]}}>
                STAFF
              </Table.Th>
              <Table.Th style={{ fontWeight: "bold", textAlign: "left", backgroundColor: theme.colors["neutral"][3] }}>
                CAMPER
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Math.max(
              assignments.staffIds.length,
              assignments.camperIds.length
            ) > 0 &&
              Array.from({
                length: Math.max(
                  assignments.staffIds.length,
                  assignments.camperIds.length
                ),
              }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    {assignments.staffIds[index] ? (
                      <Text>{assignments.staffIds[index]}</Text>
                    ) : null}
                  </Table.Td>
                  <Table.Td>
                    {assignments.camperIds[index] ? (
                      <Text>{assignments.camperIds[index]}</Text>
                    ) : null}
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      ) : isBunkAssignments(assignments) ? (
        <Table withTableBorder={false} withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ fontWeight: "bold", textAlign: "left", backgroundColor: theme.colors["neutral"][3] }}>
                BUNKS
              </Table.Th>
              <Table.Th style={{ fontWeight: "bold", textAlign: "left", backgroundColor: theme.colors["neutral"][3] }}>
                ADMIN
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Math.max(
              assignments.bunkNums.length,
              assignments.adminIds.length
            ) > 0 &&
              Array.from({
                length: Math.max(
                  assignments.bunkNums.length,
                  assignments.adminIds.length
                ),
              }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    {assignments.bunkNums[index] !== undefined ? (
                      <Text>{assignments.bunkNums[index]}</Text>
                    ) : null}
                  </Table.Td>
                  <Table.Td>
                    {assignments.adminIds[index] !== undefined ? (
                      <Text>{assignments.adminIds[index]}</Text>
                    ) : null}
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      ) : null}
    </Box>
  );
}
