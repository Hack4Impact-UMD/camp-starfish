import { ParsedCamperCsvData } from "@/features/personManagement/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Select, Table, Text } from "@mantine/core";
import { GENDERS, getFullName } from "@/types/people/personUtils";
import { Camper, Gender } from "@/types/people/personTypes";
import { DatePickerInput } from "@mantine/dates";
import { Moment } from "moment";
import { useMemo } from "react";
import { Nullable } from "@/utils/types/typeUtils";
import moment from "moment";

interface CamperPeopleInputTableProps {
  campers: ParsedCamperCsvData;
  genderSelects: { [camperId: number]: Gender | null };
  setGenderSelects: React.Dispatch<
    React.SetStateAction<{
      [camperId: number]: Gender | null;
    }>
  >;
  dateOfBirthSelects: { [camperId: number]: Moment | null };
  setDateOfBirthSelects: React.Dispatch<
    React.SetStateAction<{
      [camperId: number]: Moment | null;
    }>
  >;
}

export default function CamperPeopleInputTable(
  props: CamperPeopleInputTableProps,
) {
  const {
    campers,
    genderSelects,
    setGenderSelects,
    dateOfBirthSelects,
    setDateOfBirthSelects,
  } = props;

  const camperData = useMemo(
    () =>
      campers.campers.map((camper) => ({
        ...camper,
        gender: genderSelects[camper.id],
        dateOfBirth: dateOfBirthSelects[camper.id],
      })),
    [campers, genderSelects, dateOfBirthSelects],
  );

  const camperColumns = useMemo(() => {
    const columnHelper = createColumnHelper<
      ParsedCamperCsvData["campers"][number] &
        Nullable<Pick<Camper, "gender" | "dateOfBirth">>
    >();

    return [
      columnHelper.accessor((row) => row.id, {
        id: "id",
        header: "ID",
      }),
      columnHelper.accessor((row) => getFullName(row.name), {
        id: "name",
        header: "Name",
      }),
      columnHelper.display({
        id: "gender",
        header: "Gender",
        cell: (props) => (
          <Select
            data={GENDERS}
            value={props.row.original.gender}
            onChange={(val) =>
              setGenderSelects((prev) => ({
                ...prev,
                [props.cell.row.original.id]: val,
              }))
            }
          />
        ),
      }),
      columnHelper.display({
        id: "dateOfBirth",
        header: "Date of Birth",
        cell: (props) => (
          <DatePickerInput
            value={props.row.original.dateOfBirth?.toDate()}
            onChange={(val) =>
              setDateOfBirthSelects((prev) => ({
                ...prev,
                [props.cell.row.original.id]: moment(val),
              }))
            }
          />
        ),
      }),
    ];
  }, [setGenderSelects, setDateOfBirthSelects]);

  const camperTable = useReactTable({
    data: camperData,
    columns: camperColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-col gap-xs">
        <Text>Campers</Text>
        <Table>
          <Table.Thead>
            {camperTable.getHeaderGroups().map((headerGroup) => (
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
            {camperTable.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
