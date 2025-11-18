import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { AttendeeID } from "@/types/sessionTypes";
import {
  Box,
  Button,
  Container,
  Flex,
  Radio,
  Select,
  ScrollArea,
} from "@mantine/core";
import useDirectoryTable from "./useDirectoryTable";
import { DirectoryTableCell } from "./DirectoryTableCell";
import moment from "moment";

export const DirectoryTableView = () => {
  const { attendeeList, isLoading } = useDirectoryTable("session1"); // need to make this a prop
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [sortNameOption, setSortNameOption] = useState<string | null>(null);

  const [attendeeIDMap, setAttendeeIDMap] = useState<Map<number, AttendeeID>>(
    new Map()
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const data: AttendeeID[] = useMemo(() => {
    if (!attendeeList) return [];

    const filteredData = selectedRole
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

  // processes cell data for table
  const renderCell = (value: string) => {
    return value === undefined ? "N/A" : value;
  };

  const renderCellDate = (value: string) => {
    return value === undefined ? "N/A" : moment(value).format("MM-YYYY");
  };

  useEffect(() => {
    if (attendeeList && attendeeList.length > 0) {
      const map = new Map<number, AttendeeID>();
      for (const attendee of attendeeList) {
        map.set(attendee.id, attendee);
      }
      setAttendeeIDMap(map);
      setIsMapReady(true);
    }
  }, [attendeeList]);

  const parseIDList = (idList: string[]): string => {
    console.log(idList);
    if (!attendeeIDMap || !idList) {
      return "N/A";
    }
    const names: string[] = [];
    for (const id of idList) {
      const numberID = Number(id);
      const attendee = attendeeIDMap.get(numberID);
      if (attendee) {
        console.log(attendee);
        names.push(attendee.name.firstName);
      }
    }
    if (names.length > 0) {
      return names.join(", ");
    }
    return "N/A";
  };

  // column definitions for the table
  const columns = useMemo<MRT_ColumnDef<AttendeeID>[]>(
    () => [
      {
        accessorKey: "id",
        id: "id",
        header: "ID",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorFn: (row) => `${row.name.firstName}`,
        id: "firstName",
        header: "FIRST NAME",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorFn: (row) => `${row.name.lastName}`,
        id: "lastName",
        header: "LAST NAME",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorKey: "ageGroup",
        id: "ageGroup",
        header: "AGE GROUP",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorKey: "bunk",
        id: "bunk",
        header: "BUNK",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorKey: "health",
        id: "health",
        header: "HEALTH",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorKey: "gender",
        header: "GENDER",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
      {
        accessorKey: "nonoList",
        id: "nonoList",
        header: "NO-NO LIST",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={parseIDList(cell.getValue() as string[])} />
        ),
      },
      {
        accessorKey: "yesyesList",
        id: "yesyesList",
        header: "YES-YES LIST",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={parseIDList(cell.getValue() as string[])} />
        ),
      },
      {
        accessorKey: "dateOfBirth",
        id: "dateOfBirth",
        header: "DATE OF BIRTH",
        Cell: ({ cell }) => (
          <DirectoryTableCell
            data={renderCellDate(cell.getValue() as string)}
          />
        ),
      },
      {
        accessorKey: "level",
        id: "swimLevel",
        header: "SWIM LEVEL",
        Cell: ({ cell }) => (
          <DirectoryTableCell data={renderCell(cell.getValue() as string)} />
        ),
      },
    ],
    [isMapReady]
  );

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    initialState: {
      showGlobalFilter: true,
    },
    mantineTableHeadCellProps: {
      className: "text-center bg-neutral-3 py-3 px-2 border border-neutral-6",
    },
    mantineTableBodyCellProps: {
      className: "text-center truncate",
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

  const handleClearFilters = () => {
    setSelectedRole(null);
    setSortNameOption(null);
    table.setGlobalFilter("");
  };

  const filtersActive =
    !!selectedRole || !!sortNameOption || !!table.getState().globalFilter;
  return (
    <Container>
      {(isLoading || !attendeeIDMap) && <>Loading Table</>}
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
            {filtersActive && (
              <Button color="red" variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Flex>
        </Box>
        <ScrollArea>
          <MRT_TableContainer table={table} />
        </ScrollArea>
        <Box>
          <Flex justify="flex-start">
            <MRT_TablePagination table={table} />
          </Flex>
          <Box style={{ display: "grid", width: "100%" }}>
            <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};
