import { ParsedEmployeeCsvData } from "@/features/userManagement/types";
import { useReactTable } from "@tanstack/react-table";
import { Select, Text } from "@mantine/core";
import { getFullName } from "@/types/users/userUtils";
import { EmployeeRole } from "@/types/users/userTypes";

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

export default function EmployeeUsersInputTable(
  props: EmployeeUsersInputTableProps,
) {
  const { employees, roleSelects, setRoleSelects } = props;

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
