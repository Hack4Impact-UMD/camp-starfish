"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Button,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  ScrollArea,
  Badge,
  ActionIcon,
  Flex,
  Stack,
} from "@mantine/core";
import { MdSearch, MdDelete, MdKeyboardArrowUp, MdKeyboardArrowDown, MdUnfoldMore } from "react-icons/md";
import { UpdateData } from "firebase/firestore";
import { User, Role } from "@/types/users/userTypes";
import { UserDoc } from "@/data/firestore/types/documents";
import { useAuth } from "@/auth/useAuth";
import useUpdateUser from "@/hooks/users/useUpdateUser";
import useDeleteUser from "@/hooks/users/useDeleteUser";
import { ALL_ROLES, ROLE_COLORS, formatRole } from "./userRoles";
import { openRoleChangeModal, openDeleteUserModal } from "./userModals";

interface UserManagementPageProps {
  users: User[];
}

export default function UserManagementPage({ users }: UserManagementPageProps) {
  const { token } = useAuth();
  // `campminderId` is set as a custom claim at account creation and equals the user's id.
  const currentUserId = token?.claims.campminderId as number | undefined;

  const { mutate: updateUserRole } = useUpdateUser();
  const { mutate: deleteUserById } = useDeleteUser();

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const data = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "firstName",
      accessorFn: (row) => row.name.firstName,
      header: ({ column }) => <SortableHeader label="FIRST NAME" column={column} />,
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "middleName",
      accessorFn: (row) => row.name.middleName ?? "",
      header: "MIDDLE NAME",
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "lastName",
      accessorFn: (row) => row.name.lastName,
      header: ({ column }) => <SortableHeader label="LAST NAME" column={column} />,
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "email",
      accessorFn: (row) => row.email ?? "",
      header: ({ column }) => <SortableHeader label="EMAIL" column={column} />,
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "role",
      accessorFn: (row) => row.role,
      header: "ROLE",
      cell: (info) => {
        const user = info.row.original;
        const isSelf = currentUserId !== undefined && currentUserId === user.id;
        return (
          <Select
            size="xs"
            value={user.role}
            disabled={isSelf}
            title={isSelf ? "You cannot change your own role" : undefined}
            data={ALL_ROLES.map((r) => ({ value: r, label: formatRole(r) }))}
            onChange={(newRole) => {
              if (newRole && newRole !== user.role) {
                openRoleChangeModal({
                  user,
                  newRole: newRole as Role,
                  // `role` is part of a discriminated union, so a runtime-selected value must be
                  // cast; reconciling role-specific fields is handled by the planned backend role-change fn.
                  onConfirm: () => updateUserRole({ id: user.id, updates: { role: newRole } as UpdateData<UserDoc> }),
                });
              }
            }}
            allowDeselect={false}
            miw={130}
            renderOption={({ option }) => (
              <Badge color={ROLE_COLORS[option.value as Role]} variant="light" size="sm">
                {option.label}
              </Badge>
            )}
          />
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: (info) => {
        const user = info.row.original;
        const isSelf = currentUserId !== undefined && currentUserId === user.id;
        return (
          <Group justify="center">
            <ActionIcon
              color="red"
              variant="light"
              size="sm"
              aria-label="Delete user"
              disabled={isSelf}
              title={isSelf ? "You cannot delete your own account" : undefined}
              onClick={() => openDeleteUserModal({ user, onConfirm: () => deleteUserById(user.id) })}
            >
              <MdDelete size={14} />
            </ActionIcon>
          </Group>
        );
      },
      enableSorting: false,
    },
  ], [currentUserId, updateUserRole, deleteUserById]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-12 py-8">
        {/* Header */}
        <Stack gap="xs" mb="xl">
          <Title order={2} className="font-lato font-bold">
            User Management
          </Title>
          <Text c="dimmed" size="sm">
            Control access, assign roles, and monitor activity
          </Text>
        </Stack>

        {/* Search & Filter Bar */}
        <Flex gap="md" align="center" mb="md" wrap="wrap">
          <TextInput
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            leftSection={<MdSearch size={16} />}
            miw={280}
          />
          <Select
            placeholder="Filter by role"
            data={[
              { value: "", label: "All Roles" },
              ...ALL_ROLES.map((r) => ({ value: r, label: formatRole(r) })),
            ]}
            value={roleFilter ?? ""}
            onChange={(v) => setRoleFilter(v || null)}
            clearable
            miw={180}
          />
          {(globalFilter || roleFilter) && (
            <Button
              variant="light"
              color="red"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setRoleFilter(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Flex>

        {/* Table */}
        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              {table.getHeaderGroups().map((hg) => (
                <Table.Tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <Table.Th key={header.id} className="whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} className="text-center p-8">
                    <Text c="dimmed">No users found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Table.Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        <Flex justify="space-between" align="center" mt="md" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            {totalRows === 0 ? "No entries" : `Showing ${start}–${end} of ${totalRows} entries`}
          </Text>
          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Text size="sm">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </Text>
            <Button
              variant="default"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </Group>
        </Flex>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void };
}) {
  const sorted = column.getIsSorted();
  return (
    <Group
      gap={4}
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <Text size="sm" fw={600}>
        {label}
      </Text>
      {sorted === "asc" ? (
        <MdKeyboardArrowUp size={14} />
      ) : sorted === "desc" ? (
        <MdKeyboardArrowDown size={14} />
      ) : (
        <MdUnfoldMore size={14} className="opacity-40" />
      )}
    </Group>
  );
}
