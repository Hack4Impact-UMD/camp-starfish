import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useAddAttendeesModalStoreActions,
  useAdditionalCamperData,
} from "./AddAttendeesModalStore";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { Button, NumberInput, Select, Table } from "@mantine/core";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { useMemo } from "react";

export default function InputCamperDataScreen() {
  const additionalCamperData = useAdditionalCamperData();
  const { prevStep, nextStep, setAgeGroup, setBunk } = useAddAttendeesModalStoreActions();

  const camperIds = useMemo(
    () => getObjectKeysAsNumbers(additionalCamperData),
    [additionalCamperData],
  );

  const userDirectoryQuery = useUserDirectory();

  if (!userDirectoryQuery.data) return <div>Bruh</div>;

  const isAllAdditionalCamperDataInputted = camperIds.every(camperId => additionalCamperData[camperId].ageGroup && additionalCamperData[camperId].bunk);

  const columnHelper = createColumnHelper<number>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((camperId) => camperId, { header: "ID" }),
      columnHelper.accessor(
        (camperId) => getFullName(userDirectoryQuery.data?.[camperId].name),
        { header: "Name" },
      ),
      columnHelper.accessor(
        (camperId) => additionalCamperData[camperId]?.ageGroup,
        {
          header: "Age Group",
          cell: ({ cell }) => (
            <Select
              value={cell.getValue()}
              data={AGE_GROUPS}
              onChange={(val) =>
                setAgeGroup(cell.row.original, val ?? undefined)
              }
            />
          ),
        },
      ),
      columnHelper.accessor(
        (camperId) => additionalCamperData[camperId]?.bunk,
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
    ],
    [
      userDirectoryQuery.data,
      additionalCamperData,
      columnHelper,
      setAgeGroup,
      setBunk,
    ],
  );

  const table = useReactTable({
    data: camperIds,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-sm">
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
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep} disabled={() => !isAllAdditionalCamperDataInputted()}>Next</Button>
      </div>
    </div>
  );
}
