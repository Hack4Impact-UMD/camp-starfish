import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  InputStaffDataFormValidator,
  useAddAttendeesModalStoreActions,
  useAdditionalStaffData,
} from "./AddAttendeesModalStore";
import { getUseUserDirectoryOptions } from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { Button, Checkbox, NumberInput, Table } from "@mantine/core";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { useMemo } from "react";
import { Name } from "@/types/users/userTypes";
import { useSuspenseQuery } from "@tanstack/react-query";

interface InputStaffTableRow {
  stafferId: number;
  name: Name;
  bunk: number | undefined;
  isLeadBunkCounselor: boolean;
}

export default function InputStaffDataScreen() {
  const additionalStaffData = useAdditionalStaffData();
  const { prevStep, nextStep, setBunk, setIsLeadBunkCounselor } =
    useAddAttendeesModalStoreActions();

  const userDirectoryQuery = useSuspenseQuery(getUseUserDirectoryOptions());

  const data = useMemo(() => {
    const staffIds = getObjectKeysAsNumbers(additionalStaffData);
    return staffIds.map((stafferId) => ({
      stafferId,
      name: userDirectoryQuery.data[stafferId].name,
      bunk: additionalStaffData[stafferId].bunk,
      isLeadBunkCounselor: additionalStaffData[stafferId].isLeadBunkCounselor,
    }));
  }, [additionalStaffData, userDirectoryQuery.data]);

  const additionalStaffDataValidationResult = InputStaffDataFormValidator.safeParse(additionalStaffData);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<InputStaffTableRow>();
    return [
      columnHelper.accessor("stafferId", { header: "ID" }),
      columnHelper.accessor((row) => getFullName(row.name), { header: "Name" }),
      columnHelper.accessor("bunk", {
        header: "Bunk",
        cell: ({ cell, row }) => (
          <NumberInput
            key={cell.id}
            value={cell.getValue()}
            onChange={(val) => setBunk(row.original.stafferId, Number(val))}
          />
        ),
      }),
      columnHelper.accessor("isLeadBunkCounselor", {
        header: "Is Lead Bunk Counselor",
        cell: ({ cell, row }) => (
          <Checkbox
            key={cell.id}
            checked={row.original.isLeadBunkCounselor}
            onChange={(event) =>
              setIsLeadBunkCounselor(
                row.original.stafferId,
                event.currentTarget.checked,
              )
            }
          />
        ),
      }),
    ];
  }, [setBunk, setIsLeadBunkCounselor]);

  const table = useReactTable({
    data,
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
                <Table.Th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <Table.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <div className="flex flex-row justify-around w-full">
        <Button onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep} disabled={!additionalStaffDataValidationResult.success}>
          Next
        </Button>
      </div>
    </div>
  );
}
