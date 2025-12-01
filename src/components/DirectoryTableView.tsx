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
  Title
} from "@mantine/core";
import { useAttendees } from "@/hooks/attendees/useAttendees";
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


type LargeDirectoryBlockProps = { 
    sessionId: string;
};
export default function DirectoryTableView ({ sessionId }: LargeDirectoryBlockProps) {

  const { data: attendeeList, isLoading } = useAttendees(sessionId);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [sortNameOption, setSortNameOption] = useState<string | null>(null);

  // table filter/pagination options
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10,});

  const [attendeeIDMap, setAttendeeIDMap] = useState<Map<number, AttendeeID>>(new Map());

  const data: AttendeeID[] = useMemo(() => {
    if (!attendeeList) return [];

    let attendeeArr = [...attendeeList];

    if (selectedRole) {
      attendeeArr = attendeeArr.filter((a) => a.role === selectedRole);
    }

    if (sortNameOption) {
      attendeeArr.sort((a, b) => {
        const aFirst = a.name.firstName.toLowerCase();
        const bFirst = b.name.firstName.toLowerCase();
        const aLast = a.name.lastName.toLowerCase();
        const bLast = b.name.lastName.toLowerCase();

        switch (sortNameOption) {
          case "firstNameAZ": return aFirst.localeCompare(bFirst);
          case "firstNameZA": return bFirst.localeCompare(aFirst);
          case "lastNameAZ": return aLast.localeCompare(bLast);
          case "lastNameZA": return bLast.localeCompare(aLast);
          default: return 0;
        }
      });
    }

    return attendeeArr;
  }, [attendeeList, selectedRole, sortNameOption]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const render = (v: any) => <DirectoryTableCell data={v ?? "N/A"} />;

    if (selectedRole === "CAMPER") {
      return [
        {
          accessorFn: row => row.name.firstName,
          header: "FIRST NAME",
          cell: info => render(info.getValue()),
        },
        {
          accessorFn: row => row.name.lastName,
          header: "LAST NAME",
          cell: info => render(info.getValue()),
        },
        { accessorKey: "ageGroup", header: "AGE GROUP", cell: info => render(info.getValue()) },
        { accessorKey: "bunk", header: "BUNK", cell: info => render(info.getValue()) },
        { accessorKey: "health", header: "HEALTH", cell: info => render(info.getValue()) },
        { accessorKey: "gender", header: "GENDER", cell: info => render(info.getValue()) },
        {
          accessorKey: "nonoList",
          header: "NO-NO LIST",
          cell: info => {
            const list = info.getValue<string[]>();
            return render(list && list.length ? list.join(", ") : "N/A");
          },
        },
        {
          accessorFn: row => row.dateOfBirth,
          header: "DOB",
          cell: info => {
            const dob = info.getValue<string>();
            return render(dob ? moment(dob).format("MM-YYYY") : "N/A");
          },
        },
        { accessorKey: "level", header: "SWIM LEVEL", cell: info => render(info.getValue()) },
      ];
    }

    if (selectedRole === "STAFF") {
      return [
        { accessorFn: row => row.name.firstName, header: "FIRST NAME", cell: info => render(info.getValue()) },
        { accessorFn: row => row.name.lastName, header: "LAST NAME", cell: info => render(info.getValue()) },
        { accessorKey: "bunk", header: "BUNK", cell: info => render(info.getValue()) },
        { accessorKey: "gender", header: "GENDER", cell: info => render(info.getValue()) },
        {
          accessorKey: "nonoList",
          header: "NO-NO LIST",
          cell: info => {
            const list = info.getValue<string[]>();
            return render(list && list.length ? list.join(", ") : "N/A");
          },
        },
        {
          accessorKey: "yesyesList",
          header: "YES-YES LIST",
          cell: info => {
            const list = info.getValue<string[]>();
            return render(list && list.length ? list.join(", ") : "N/A");
          },
        },
        {
          accessorFn: row => row.programCounselor?.name,
          header: "Program Counselor",
          cell: info => render(info.getValue()),
        },
        {
          accessorKey: "leadBunkCounselor",
          header: "Lead Bunk Counselor",
          cell: info => {
            const val = info.getValue<boolean>();
            return render(val ? "Yes" : "No");
          },
        },
        {
          accessorKey: "daysOff",
          header: "Days Off",
          cell: info => {
            const dates = info.getValue<string[]>();
            if (!dates || dates.length === 0) return render("N/A");
            return render(dates.map(d => moment(d).format("MM-YYYY")).join(", "));
          },
        },
      ];
    }

    if (selectedRole === "ADMIN") {
      return [
        { accessorFn: row => row.name.firstName, header: "FIRST NAME", cell: info => render(info.getValue()) },
        { accessorFn: row => row.name.lastName, header: "LAST NAME", cell: info => render(info.getValue()) },
        { accessorKey: "gender", header: "GENDER", cell: info => render(info.getValue()) },
        {
          accessorKey: "nonoList",
          header: "NO-NO LIST",
          cell: info => {
            const list = info.getValue<string[]>();
            return render(list && list.length ? list.join(", ") : "N/A");
          },
        },
        {
          accessorKey: "yesyesList",
          header: "YES-YES LIST",
          cell: info => {
            const list = info.getValue<string[]>();
            return render(list && list.length ? list.join(", ") : "N/A");
          },
        },
        {
          accessorKey: "daysOff",
          header: "Days Off",
          cell: info => {
            const dates = info.getValue<string[]>();
            if (!dates || dates.length === 0) return render("N/A");
            return render(dates.map(d => moment(d).format("MM-YYYY")).join(", "));
          },
        },
      ];
    }

    return [];
  }, [selectedRole]);

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

  const filtersActive = !!selectedRole || !!sortNameOption || !!table.getState().globalFilter;

  return (
    <div className = "border border-black bg-[#F7F7F7] w-[80%] mx-auto py-[20px]">
      <Title order={3} className="text-center !font-bold !mb-10">DIRECTORY</Title>
      
      <Container size="90%">
        {(isLoading || !attendeeIDMap) && <>Loading Table</>}
      
        <Flex direction={"column"}>
          <Flex direction={"row"} gap="md" align="center" mb="md">
            <TextInput
              placeholder="Search directory..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-[342px] !rounded-md placeholder:text-neutral-5"
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
            <Table striped highlightOnHover className = "w-[100%] border-collapse">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} className="border border-black text-center bg-neutral-3 px-[11px] py-[10px]">
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
                      <td key={cell.id} className="text-center border border-black truncate p-0">
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

        <Group mt="md" align="center" className = "flex flex-row justify-center align-center">
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
    </div>
  );
};
