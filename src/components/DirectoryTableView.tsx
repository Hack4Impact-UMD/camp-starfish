import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo, useState } from "react";
import { Attendee, AttendeeID } from "@/types/sessionTypes";
import { Box, Container, Flex, Radio, Select } from "@mantine/core";
import useDirectoryTable from "./useDirectoryTable";

// const data: AttendeeID[] = [
//   {
//     name: {
//       firstName: "John",
//       lastName: "Doe",
//     },
//     role: "CAMPER",
//     sessionId: "session1",
//     gender: "Male",
//     dateOfBirth: "01-01-2025",
//     nonoList: [1, 2, 3],
//     ageGroup: "NAV",
//     level: 1,
//     bunk: 1,
//     id: 1,
//     swimOptOut: false,
//   },
// ];

export const DirectoryTableView = () => {
  const {attendeeList, isLoading, error} = useDirectoryTable("session1");
  const data = attendeeList ?? [];
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const columns = useMemo<MRT_ColumnDef<Attendee>[]>(
    () => [
      {
        accessorFn: (row) => `${row.name.firstName}`,
        id: "firstName",
        header: "FIRST NAME",
      },
      {
        accessorFn: (row) => `${row.name.lastName}`,
        id: "lastName",
        header: "LAST NAME",
      },
      {
        accessorKey: "ageGroup",
        id: "ageGroup",
        header: "AGE GROUP",
      },
      {
        accessorKey: "bunk",
        id: "bunk",
        header: "BUNK",
      },
      {
        accessorKey: "health",
        id: "health",
        header: "HEALTH",
      },
      {
        accessorKey: "gender",
        header: "GENDER",
      },
      {
        accessorKey: "nonoList",
        id: "nonoList",
        header: "NO-NO LIST",
      },
      {
        accessorKey: "yesyesList",
        id: "yesyesList",
        header: "YES-YES LIST",
      },
      {
        accessorKey: "dateOfBirth",
        id: "dateOfBirth",
        header: "DATE OF BIRTH",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableSorting: false,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    initialState: {
      showGlobalFilter: true,
    },
  });

  const handleRoleSelect = (value: string) => {
    const newValue = selectedRole === value ? null : value;
    setSelectedRole(newValue);
    table.setGlobalFilter(newValue);
  };
  return (
    <Container>
      {isLoading && <>Loading Table</>}
      <Flex direction={"column"}>
        <Box>
          <Flex direction={"row"} gap={"md"} align={"baseline"}>
            <Box mb={"md"}>
              <MRT_GlobalFilterTextInput table={table} />
            </Box>
            <Box>
              <Flex gap="sm">
                {["CAMPER", "STAFF", "ADMIN"].map((role) => (
                  <Radio
                    key={role}
                    label={role.charAt(0) + role.slice(1).toLowerCase()}
                    checked={selectedRole === role}
                    onChange={() => handleRoleSelect(role)}
                  />
                ))}
              </Flex>
            </Box>
            <Box>
              <Select
                placeholder="Sort By: "
                data={[
                  "First Name (A -> Z)",
                  "First Name (Z -> A)",
                  "Last Name (A -> Z)",
                  "Last Name (Z -> A)",
                ]}
              />
            </Box>
            <Box>
              {" "}
              <Select
                placeholder="0 Filters Applied "
                data={["React", "Angular", "Vue", "Svelte"]}
              />
            </Box>
          </Flex>
        </Box>
        <MRT_TableContainer table={table} />
        <Box>
          <Flex justify="flex-start">
            <MRT_TablePagination table={table} />
          </Flex>
          <Box sx={{ display: "grid", width: "100%" }}>
            <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
          </Box>
        </Box>
      </Flex>
    </Container>
  );

  // return <MantineReactTable table={table} />;
};
