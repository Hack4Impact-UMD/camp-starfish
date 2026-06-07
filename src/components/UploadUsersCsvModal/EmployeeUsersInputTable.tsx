import { ParsedEmployeeCsvData } from "@/features/userManagement/types";
import { ColumnDef, createColumnHelper, useReactTable } from "@tanstack/react-table";
import { Select, Text } from "@mantine/core";
import { getFullName } from "@/types/users/userUtils";
import { Employee, EmployeeRole } from "@/types/users/userTypes";
import { DatePicker } from "@mantine/dates";

interface EmployeeUsersInputTableProps {
  employees: ParsedEmployeeCsvData;
  roleSelects: {
    [employeeId: number]: EmployeeRole;
  };
  setRoleSelects: React.Dispatch<
    React.SetStateAction<{
      [employeeId: number]: EmployeeRole;
    } | null>
  >;
}

const columnHelper = createColumnHelper<Pick<Employee, "id" | "name" | "email" | "role" | "gender" | "dateOfBirth">>();

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
  const { employees, roleSelects, setRoleSelects } = props;

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: (rows) => rows,
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
