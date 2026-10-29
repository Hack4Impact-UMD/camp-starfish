import { ParsedCounselorCsvData } from "@/features/userManagement/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Select, Table, Text } from "@mantine/core";
import { COUNSELOR_ROLES, GENDERS, getFullName } from "@/types/users/userUtils";
import { Counselor, CounselorRole, Gender } from "@/types/users/userTypes";
import { DatePickerInput } from "@mantine/dates";
import { Moment } from "moment";
import { useMemo } from "react";
import { Nullable } from "@/utils/types/typeUtils";
import moment from "moment";

interface CounselorUsersInputTableProps {
  counselors: ParsedCounselorCsvData;
  roleSelects: {
    [counselorId: number]: CounselorRole | null;
  };
  setRoleSelects: React.Dispatch<
    React.SetStateAction<{
      [counselorId: number]: CounselorRole | null;
    } | null>
  >;
  genderSelects: { [counselorId: number]: Gender | null };
  setGenderSelects: React.Dispatch<
    React.SetStateAction<{
      [counselorId: number]: Gender | null;
    }>
  >;
  dateOfBirthSelects: { [counselorId: number]: Moment | null };
  setDateOfBirthSelects: React.Dispatch<
    React.SetStateAction<{
      [counselorId: number]: Moment | null;
    }>
  >;
}

export default function CounselorUsersInputTable(
  props: CounselorUsersInputTableProps,
) {
  const {
    counselors,
    roleSelects,
    setRoleSelects,
    genderSelects,
    setGenderSelects,
    dateOfBirthSelects,
    setDateOfBirthSelects,
  } = props;

  const data = useMemo(
    () =>
      counselors.map((counselor) => ({
        ...counselor,
        role: roleSelects[counselor.id],
        gender: genderSelects[counselor.id],
        dateOfBirth: dateOfBirthSelects[counselor.id],
      })),
    [counselors, roleSelects, genderSelects, dateOfBirthSelects],
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<
      ParsedCounselorCsvData[number] &
        Nullable<Pick<Counselor, "role" | "gender" | "dateOfBirth">>
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
        id: "role",
        header: "Role",
        cell: (props) => (
          <Select
            data={COUNSELOR_ROLES}
            value={props.row.original.role}
            onChange={(val) =>
              setRoleSelects((prev) => ({
                ...prev,
                [props.cell.row.original.id]: val,
              }))
            }
          />
        ),
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
  }, [setRoleSelects, setGenderSelects, setDateOfBirthSelects]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-xs">
      <Text>Counselors</Text>
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
  );
}
