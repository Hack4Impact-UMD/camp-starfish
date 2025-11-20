import { flexRender } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AttendeeID } from "@/types/sessionTypes";
import {
  Button,
  Container,
  Flex,
  Radio,
  Select,
  ScrollArea,
  Table,
  TextInput,
  Group,
  Text,
} from "@mantine/core";
import useDirectoryTable from "./useDirectoryTable";
import { DirectoryTableCell } from "./DirectoryTableCell";
import moment from "moment";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";

export const DirectoryTableView = () => {
  const { attendeeList, isLoading } = useDirectoryTable("session1"); // need to make this a prop
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [sortNameOption, setSortNameOption] = useState<string | null>(null);

  // table filter/pagination options
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [attendeeIDMap, setAttendeeIDMap] = useState<Map<number, AttendeeID>>(
    new Map()
  );
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
    }
  }, [attendeeList]);

  const parseIDList = useCallback(
    (idList: string[]): string => {
      if (!attendeeIDMap || !idList) return "N/A";

      const names: string[] = [];

      for (const id of idList) {
        const numberID = Number(id);
        const attendee = attendeeIDMap.get(numberID);

        if (attendee) names.push(attendee.name.firstName);
      }

      return names.length ? names.join(", ") : "N/A";
    },
    [attendeeIDMap]
  );

  // column definitions for the table
  const columns = useMemo<ColumnDef<AttendeeID>[]>(
    () => [

      {
        accessorFn: (row) => `${row.name.firstName}`,
        id: "firstName",
        header: "FIRST NAME",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorFn: (row) => `${row.name.lastName}`,
        id: "lastName",
        header: "LAST NAME",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorKey: "ageGroup",
        id: "ageGroup",
        header: "AGE GROUP",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorKey: "bunk",
        id: "bunk",
        header: "BUNK",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorKey: "health",
        id: "health",
        header: "HEALTH",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorKey: "gender",
        header: "GENDER",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
      {
        accessorKey: "nonoList",
        id: "nonoList",
        header: "NO-NO LIST",
        cell: (info) => (
          <DirectoryTableCell data={parseIDList(info.getValue() as string[])} />
        ),
      },
      {
        accessorKey: "yesyesList",
        id: "yesyesList",
        header: "YES-YES LIST",
        cell: (info) => (
          <DirectoryTableCell data={parseIDList(info.getValue() as string[])} />
        ),
      },
      {
        accessorKey: "dateOfBirth",
        id: "dateOfBirth",
        header: "DATE OF BIRTH",
        cell: (info) => (
          <DirectoryTableCell
            data={renderCellDate(info.getValue() as string)}
          />
        ),
      },
      {
        accessorKey: "level",
        id: "swimLevel",
        header: "SWIM LEVEL",
        cell: (info) => (
          <DirectoryTableCell data={renderCell(info.getValue() as string)} />
        ),
      },
    ],
    [parseIDList]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleClearFilters = () => {
    setSelectedRole(null);
    setSortNameOption(null);
    setGlobalFilter("");
  };

  const filtersActive =
    !!selectedRole || !!sortNameOption || !!table.getState().globalFilter;
  return (
    <Container>
      {(isLoading || !attendeeIDMap) && <>Loading Table</>}

      <Flex direction={"column"}>
        <Flex direction={"row"} gap="md" align="center" mb="md">
          <TextInput
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />

          <Flex gap="sm" direction="row">
            <Radio.Group
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              name="role-group"
            >
              <Flex direction="row" gap="sm">
                {["CAMPER", "STAFF", "ADMIN"].map((role) => (
                  <Radio
                    key={role}
                    value={role}
                    label={role.charAt(0) + role.slice(1).toLowerCase()}
                  />
                ))}
              </Flex>
            </Radio.Group>
          </Flex>

          <Select
            value={sortNameOption}
            onChange={(v) => setSortNameOption(v)}
            placeholder="Sort By:"
            data={[
              { value: "firstNameAZ", label: "First Name (A → Z)" },
              { value: "firstNameZA", label: "First Name (Z → A)" },
              { value: "lastNameAZ", label: "Last Name (A → Z)" },
              { value: "lastNameZA", label: "Last Name (Z → A)" },
            ]}
          />

          {filtersActive && (
            <Button color="red" variant="light" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </Flex>

        <ScrollArea>
          <Table striped highlightOnHover withColumnBorders>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="text-center bg-neutral-3">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="text-center truncate">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </Flex>

      <Group mt="md" align="center">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Text>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </Text>

        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </Group>
    </Container>
  );
};
