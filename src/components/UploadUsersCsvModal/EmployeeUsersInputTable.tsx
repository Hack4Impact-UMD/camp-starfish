import { ParsedEmployeeCsvData } from "@/features/userManagement/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Select, Table, Text } from "@mantine/core";
import { EMPLOYEE_ROLES, GENDERS, getFullName } from "@/types/users/userUtils";
import { Employee, EmployeeRole, Gender } from "@/types/users/userTypes";
import { DatePickerInput } from "@mantine/dates";
import { Moment } from "moment";
import { useMemo } from "react";
import { Nullable } from "@/utils/types/typeUtils";
import moment from "moment";

interface EmployeeUsersInputTableProps {
  employees: ParsedEmployeeCsvData;
  roleSelects: {
    [employeeId: number]: EmployeeRole | null;
  };
  setRoleSelects: React.Dispatch<
    React.SetStateAction<{
      [employeeId: number]: EmployeeRole | null;
    } | null>
  >;
  genderSelects: { [employeeId: number]: Gender | null };
  setGenderSelects: React.Dispatch<
    React.SetStateAction<{
      [employeeId: number]: Gender | null;
    }>
  >;
  dateOfBirthSelects: { [employeeId: number]: Moment | null };
  setDateOfBirthSelects: React.Dispatch<
    React.SetStateAction<{
      [employeeId: number]: Moment | null;
    }>
  >;
}

export default function EmployeeUsersInputTable(
  props: EmployeeUsersInputTableProps,
) {
  const {
    employees,
    roleSelects,
    setRoleSelects,
    genderSelects,
    setGenderSelects,
    dateOfBirthSelects,
    setDateOfBirthSelects,
  } = props;

  const data = useMemo(
    () =>
      employees.map((employee) => ({
        ...employee,
        role: roleSelects[employee.id],
        gender: genderSelects[employee.id],
        dateOfBirth: dateOfBirthSelects[employee.id],
      })),
    [employees, roleSelects, genderSelects, dateOfBirthSelects],
  );
  console.log(data);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<
      ParsedEmployeeCsvData[number] &
        Nullable<Pick<Employee, "role" | "gender" | "dateOfBirth">>
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
            data={EMPLOYEE_ROLES}
            value={props.row.original.role}
            onChange={(val) => setRoleSelects((prev) => ({
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
        cell: (props) => (<Select
          data={GENDERS}
          value={props.row.original.gender}
          onChange={(val) => setGenderSelects((prev) => ({
            ...prev,
            [props.cell.row.original.id]: val,
          }))}
        />),
      }),
      columnHelper.display({
        id: "dateOfBirth",
        header: "Date of Birth",
        cell: (props) => (<DatePickerInput
          value={props.row.original.dateOfBirth?.toDate()}
          onChange={(val) => setDateOfBirthSelects((prev) => ({
            ...prev,
            [props.cell.row.original.id]: moment(val),
          }))}
        />),
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
      <Text>Employees</Text>
      <Table>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),)}
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
