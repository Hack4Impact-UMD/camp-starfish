import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  InputCamperDataFormValidator,
  useAddAttendeesModalActions,
  useAdditionalCamperData,
} from "./AddAttendeesModalStore";
import { AGE_GROUPS, AgeGroup } from "@/types/sessions/sessionTypes";
import { getUseUserDirectoryOptions } from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { Button, NumberInput, Select, Table } from "@mantine/core";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { useMemo } from "react";
import { Name } from "@/types/users/userTypes";
import { useSuspenseQuery } from "@tanstack/react-query";

interface InputCamperDataTableRow {
  camperId: number;
  name: Name;
  ageGroup: AgeGroup | undefined;
  bunk: number | undefined;
}

export default function InputCamperDataScreen() {
  const additionalCamperData = useAdditionalCamperData();
  const { prevStep, nextStep, setAgeGroup, setBunk } =
    useAddAttendeesModalActions();

  const userDirectoryQuery = useSuspenseQuery(getUseUserDirectoryOptions());

  const data: InputCamperDataTableRow[] = useMemo(() => {
    const camperIds = getObjectKeysAsNumbers(additionalCamperData);
    return camperIds.map((camperId) => ({
      camperId,
      name: userDirectoryQuery.data[camperId].name,
      ageGroup: additionalCamperData[camperId].ageGroup,
      bunk: additionalCamperData[camperId].bunk,
    }));
  }, [userDirectoryQuery.data, additionalCamperData]);

  const additionalCamperDataValidationResult =
    InputCamperDataFormValidator.safeParse(additionalCamperData);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<InputCamperDataTableRow>();
    return [
      columnHelper.accessor("camperId", { header: "ID" }),
      columnHelper.accessor((row) => getFullName(row.name), { header: "Name" }),
      columnHelper.accessor("ageGroup", {
        header: "Age Group",
        cell: ({ cell, row }) => (
          <Select
            value={cell.getValue()}
            data={AGE_GROUPS}
            onChange={(val) =>
              setAgeGroup(row.original.camperId, val ?? undefined)
            }
          />
        ),
      }),
      columnHelper.accessor("bunk", {
        header: "Bunk",
        cell: ({ cell, row }) => (
          <NumberInput
            value={cell.getValue()}
            onChange={(val) => setBunk(row.original.camperId, Number(val))}
          />
        ),
      }),
    ];
  }, [setAgeGroup, setBunk]);

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
        <Button
          onClick={nextStep}
          disabled={!additionalCamperDataValidationResult.success}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
