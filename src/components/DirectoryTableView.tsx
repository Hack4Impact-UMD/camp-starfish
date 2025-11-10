import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
  MRT_SortingFn
} from "mantine-react-table";
import { useMemo, useState } from "react";
import { Attendee, AttendeeID } from "@/types/sessionTypes";
import { Box, Container, Flex, Radio, Select } from "@mantine/core";
import useDirectoryTable from "./useDirectoryTable";

export const DirectoryTableView = () => {
  const { attendeeList, isLoading, error } = useDirectoryTable("session1");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [sortNameOption, setSortNameOption] = useState<string | null>(null);
  const data: Attendee[] = useMemo(() => {
    if (!attendeeList) return [];

    let filteredData = selectedRole
      ? attendeeList.filter((attendee) => attendee.role === selectedRole)
      : [...attendeeList];

    if (sortNameOption) {
      filteredData.sort((a, b) => {
        const aFirst = a.name.firstName.toLowerCase();
        const bFirst = b.name.firstName.toLowerCase();
        const aLast = a.name.lastName.toLowerCase();
        const bLast = b.name.lastName.toLowerCase();

        switch (sortNameOption) {
          case "firstNameAZ":
            return aFirst.localeCompare(bFirst);
          case "firstNameZA":
            return bFirst.localeCompare(aFirst);
          case "lastNameAZ":
            return aLast.localeCompare(bLast);
          case "lastNameZA":
            return bLast.localeCompare(aLast);
          default:
            return 0;
        }
      });
    }

    return filteredData;
  }, [attendeeList, selectedRole, sortNameOption]);

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
  };

  const handleNameFilterSelect = (value: string | null) => {
    const newValue = sortNameOption === value ? null : value;
    setSortNameOption(newValue);
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
                value={sortNameOption}
                onChange={handleNameFilterSelect}
                placeholder="Sort By: "
                data={[
                  { value: "firstNameAZ", label: "First Name (A → Z)" },
                  { value: "firstNameZA", label: "First Name (Z → A)" },
                  { value: "lastNameAZ", label: "Last Name (A → Z)" },
                  { value: "lastNameZA", label: "Last Name (Z → A)" },
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
};
