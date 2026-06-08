import {
  ParsedEmployeeCsvData,
  ParsedFamilyCsvData,
} from "@/features/userManagement/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Select, Table, Text } from "@mantine/core";
import { EMPLOYEE_ROLES, GENDERS, getFullName } from "@/types/users/userUtils";
import {
  Camper,
  Employee,
  EmployeeRole,
  Gender,
} from "@/types/users/userTypes";
import { DatePickerInput } from "@mantine/dates";
import { Moment } from "moment";
import { useMemo } from "react";
import { Nullable } from "@/utils/types/typeUtils";
import moment from "moment";

interface FamilyUsersInputTablesProps {
  familyMembers: ParsedFamilyCsvData;
  genderSelects: { [familyMemberId: number]: Gender | null };
  setGenderSelects: React.Dispatch<
    React.SetStateAction<{
      [familyMemberId: number]: Gender | null;
    }>
  >;
  dateOfBirthSelects: { [familyMemberId: number]: Moment | null };
  setDateOfBirthSelects: React.Dispatch<
    React.SetStateAction<{
      [familyMemberId: number]: Moment | null;
    }>
  >;
}

export default function FamilyUsersInputTables(
  props: FamilyUsersInputTablesProps,
) {
  const {
    familyMembers,
    genderSelects,
    setGenderSelects,
    dateOfBirthSelects,
    setDateOfBirthSelects,
  } = props;

  const camperData = useMemo(
    () =>
      Object.values(familyMembers.campers).map((camper) => ({
        ...camper,
        gender: genderSelects[camper.id],
        dateOfBirth: dateOfBirthSelects[camper.id],
      })),
    [familyMembers, genderSelects, dateOfBirthSelects],
  );

  const camperColumns = useMemo(() => {
    const columnHelper = createColumnHelper<
      ParsedFamilyCsvData["campers"][number] &
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
  }, []);

  const camperTable = useReactTable({
    data: camperData,
    columns: camperColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentData = useMemo(
    () =>
      Object.values(familyMembers.parents).map((parent) => ({
        ...parent,
        gender: genderSelects[parent.id],
        dateOfBirth: dateOfBirthSelects[parent.id],
      })),
    [familyMembers, genderSelects, dateOfBirthSelects],
  );

  const parentColumns = useMemo(() => {
    const columnHelper = createColumnHelper<
      ParsedFamilyCsvData["parents"][number] &
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
      columnHelper.accessor((row) => row.email, {
        id: "email",
        header: "Email",
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
  }, []);

  const parentTable = useReactTable({
    data: parentData,
    columns: parentColumns,
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
      <div className="flex flex-col gap-xs">
        <Text>Parents</Text>
        <Table>
          <Table.Thead>
            {parentTable.getHeaderGroups().map((headerGroup) => (
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
            {parentTable.getRowModel().rows.map((row) => (
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
