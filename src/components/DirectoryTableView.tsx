import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ShowHideColumnsButton,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo } from "react";
import { AttendeeID } from "@/types/sessionTypes";
import { Box, Container, Flex } from "@mantine/core";

const data: AttendeeID[] = [
  {
    name: {
      firstName: "John",
      lastName: "Doe",
    },
    role: "CAMPER",
    sessionId: "session1",
    gender: "Male",
    dateOfBirth: "01-01-2025",
    nonoList: [1, 2, 3],
    ageGroup: "NAV",
    level: 1,
    bunk: 1,
    id: 1,
    swimOptOut: false,
  },
];

export const DirectoryTableView = () => {
  const columns = useMemo<MRT_ColumnDef<AttendeeID>[]>(
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
  });
  return (
    <Container>
      <Flex direction={"column"}>
        <Box>
          <Flex direction={"row"} gap={"md"}>
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
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
