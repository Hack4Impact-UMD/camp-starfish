import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useAddAttendeesModalStoreActions,
  useadditionalStaffData,
} from "./AddAttendeesModalStore";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { Checkbox, NumberInput, Table } from "@mantine/core";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { useMemo } from "react";

export default function InputStaffDataScreen() {
  const additionalStaffData = useadditionalStaffData();
  const { setBunk, setIsLeadBunkCounselor } =
    useAddAttendeesModalStoreActions();

  const staffIds = useMemo(
    () => getObjectKeysAsNumbers(additionalStaffData),
    [additionalStaffData],
  );

  const userDirectoryQuery = useUserDirectory();

  if (!userDirectoryQuery.data) return <div>Bruh</div>;

  const columnHelper = createColumnHelper<number>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((stafferId) => stafferId, { header: "ID" }),
      columnHelper.accessor(
        (stafferId) => getFullName(userDirectoryQuery.data?.[stafferId].name),
        { header: "Name" },
      ),
      columnHelper.accessor(
        (stafferId) => additionalStaffData[stafferId]?.bunk,
        {
          header: "Bunk",
          cell: ({ cell }) => (
            <NumberInput
              value={cell.getValue()}
              onChange={(val) => setBunk(cell.row.original, Number(val))}
            />
          ),
        },
      ),
      columnHelper.accessor(
        (stafferId) => additionalStaffData[stafferId]?.isLeadBunkCounselor,
        {
          header: "Is Lead Bunk Counselor",
          cell: ({ cell }) => (
            <Checkbox checked={cell.getValue()} onChange={(event) => setIsLeadBunkCounselor(cell.row.original, event.currentTarget.checked)} />
          ),
        },
      ),
    ],
    [userDirectoryQuery.data],
  );

  const table = useReactTable({
    data: staffIds,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <Table.Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.Th key={header.id}>{header.id}</Table.Th>
            ))}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map((row) => (
          <Table.Tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <Table.Td>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
