import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo } from "react";
import { Attendee, AttendeeID } from "@/types/sessionTypes";

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
        header: "Gender",
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
    enableRowSelection: true, //enable some features
    enableColumnOrdering: true,
    enableGlobalFilter: false, //turn off a feature
  });
  return <MantineReactTable table={table} />;
};
