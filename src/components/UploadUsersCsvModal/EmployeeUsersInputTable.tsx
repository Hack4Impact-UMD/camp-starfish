import { ParsedEmployeeCsvData } from "@/features/userManagement/types";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Select, Text } from "@mantine/core";
import { getFullName } from "@/types/users/userUtils";
import { Employee, EmployeeRole, Gender } from "@/types/users/userTypes";
import { DatePicker } from "@mantine/dates";
import { Moment } from "moment";
import { useMemo } from "react";
import { Nullable } from "@/utils/types/typeUtils";

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
  genderSelects: { [employeeId: number]: Gender | null; };
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

const columnHelper = createColumnHelper<ParsedEmployeeCsvData[number] & Nullable<Pick<Employee, "role" | "gender" | "dateOfBirth">>>();

const columns = [
  columnHelper.accessor((row) => row.id, {
    id: "id",
    header: "ID",
  }),
  columnHelper.accessor((row) => getFullName(row.name), {
    id: "name",
    header: "Name",
  }),
  columnHelper.accessor(row => row.email, {
    id: "email",
    header: "Email",
  }),
  columnHelper.display({
    id: "role",
    header: "Role",
    cell: () => <Select />
  }),
  columnHelper.display({
    id: "gender",
    header: "Gender",
    cell: () => <Select />
  }),
  columnHelper.display({
    id: "dateOfBirth",
    header: "Date of Birth",
    cell: () => <DatePicker />
  })
];

export default function EmployeeUsersInputTable(
  props: EmployeeUsersInputTableProps,
) {
  const { employees, roleSelects, setRoleSelects, genderSelects, setGenderSelects, dateOfBirthSelects, setDateOfBirthSelects } = props;

  const data = useMemo(() => {
    return employees.map((employee) => ({
      ...employee,
      role: roleSelects[employee.id],
      gender: genderSelects[employee.id],
      dateOfBirth: dateOfBirthSelects[employee.id],
    }))
  }, [employees, roleSelects, genderSelects, dateOfBirthSelects]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-xs">
      <Text>Employees</Text>
      {employees.map((employee) => {
        return (
          <div
            key={employee.id}
            className="flex flex-row justify-between items-center bg-neutral-3 rounded-sm p-xs"
          >
            <Text>{getFullName(employee.name)}</Text>
            <Select
              data={["ADMIN", "STAFF", "PHOTOGRAPHER"]}
              value={roleSelects[employee.id]}
              defaultValue="STAFF"
              onChange={(role) =>
                setRoleSelects((prev) =>
                  prev ? { ...prev, [employee.id]: role! } : null,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}
