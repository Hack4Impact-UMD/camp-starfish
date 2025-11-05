import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo } from "react";
import { Person } from "@/types/personTypes";

const data: Person[] = [
  {
    name: { firstName: "John", lastName: "Doe" },
    gender: "Male",
  },
  {
    name: { firstName: "Parth", lastName: "Sangani" },
    gender: "Male",
  },
];

export const DirectoryTableView = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorFn: (row) => `${row.name.firstName} ${row.name.lastName}`,
        id: "fullname",
        header: "Name",
      },
      {
        accessorKey: "gender",
        header: "Gender",
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
