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
  Modal,
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
import { IconSearch, IconTrash, IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Role } from "@/types/users/userTypes";
import { updateUser } from "@/data/firestore/users";
import { deleteUser } from "@/data/firestore/users";
import useUsers from "@/hooks/users/useUsers";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";

const ALL_ROLES: Role[] = ["ADMIN", "STAFF", "PHOTOGRAPHER", "PARENT", "CAMPER"];

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "red",
  STAFF: "blue",
  PHOTOGRAPHER: "violet",
  PARENT: "green",
  CAMPER: "orange",
};

interface PendingRoleChange {
  user: User;
  newRole: Role;
}

interface PendingDelete {
  user: User;
}

export default function UserManagementPage() {
  const usersQuery = useUsers();
  const queryClient = useQueryClient();

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const users = usersQuery.data ?? [];

  const data = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "firstName",
      accessorFn: (row) => row.name.firstName,
      header: ({ column }) => (
        <SortableHeader label="FIRST NAME" column={column} />
      ),
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
      header: ({ column }) => (
        <SortableHeader label="LAST NAME" column={column} />
      ),
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "email",
      accessorFn: (row) => row.email ?? "",
      header: ({ column }) => (
        <SortableHeader label="EMAIL" column={column} />
      ),
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "role",
      accessorFn: (row) => row.role,
      header: "ROLE",
      cell: (info) => {
        const user = info.row.original;
        return (
          <Select
            size="xs"
            value={user.role}
            data={ALL_ROLES.map((r) => ({ value: r, label: r.charAt(0) + r.slice(1).toLowerCase() }))}
            onChange={(newRole) => {
              if (newRole && newRole !== user.role) {
                setPendingRoleChange({ user, newRole: newRole as Role });
              }
            }}
            allowDeselect={false}
            styles={{ input: { minWidth: 130 } }}
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
        return (
          <Group justify="center">
            <ActionIcon
              color="red"
              variant="light"
              size="sm"
              aria-label="Delete user"
              onClick={() => setPendingDelete({ user })}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        );
      },
      enableSorting: false,
    },
  ], []);

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

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    setActionLoading(true);
    try {
      await updateUser(pendingRoleChange.user.id, { role: pendingRoleChange.newRole });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (e) {
      console.error("Failed to update role:", e);
    } finally {
      setActionLoading(false);
      setPendingRoleChange(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setActionLoading(true);
    try {
      await deleteUser(pendingDelete.user.id);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (e) {
      console.error("Failed to delete user:", e);
    } finally {
      setActionLoading(false);
      setPendingDelete(null);
    }
  };

  if (usersQuery.isPending) return <LoadingPage />;
  if (usersQuery.isError) return <ErrorPage error={new Error("Error loading users")} />;

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
            leftSection={<IconSearch size={16} stroke={1.5} />}
            style={{ minWidth: 280 }}
          />
          <Select
            placeholder="Filter by role"
            data={[
              { value: "", label: "All Roles" },
              ...ALL_ROLES.map((r) => ({
                value: r,
                label: r.charAt(0) + r.slice(1).toLowerCase(),
              })),
            ]}
            value={roleFilter ?? ""}
            onChange={(v) => setRoleFilter(v || null)}
            clearable
            style={{ minWidth: 180 }}
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
                    <Table.Th
                      key={header.id}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem" }}>
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
            {totalRows === 0
              ? "No entries"
              : `Showing ${start}–${end} of ${totalRows} entries`}
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

      {/* Role Change Confirmation Modal */}
      <Modal
        opened={!!pendingRoleChange}
        onClose={() => setPendingRoleChange(null)}
        title={<Text fw={700}>Confirm Role Change</Text>}
        centered
        size="md"
      >
        <Stack gap="lg">
          <Text>
            Are you sure you want to change{" "}
            <Text component="span" fw={600}>
              {pendingRoleChange?.user.name.firstName} {pendingRoleChange?.user.name.lastName}
            </Text>
            &apos;s role from{" "}
            <Badge color={ROLE_COLORS[pendingRoleChange?.user.role as Role]} variant="light">
              {pendingRoleChange?.user.role}
            </Badge>{" "}
            to{" "}
            <Badge color={ROLE_COLORS[pendingRoleChange?.newRole as Role]} variant="light">
              {pendingRoleChange?.newRole}
            </Badge>
            ? This will affect what they can do in the application.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setPendingRoleChange(null)} disabled={actionLoading}>
              CANCEL
            </Button>
            <Button color="blue" onClick={handleConfirmRoleChange} loading={actionLoading}>
              CONFIRM
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={<Text fw={700} c="red">WARNING! Permanent Action</Text>}
        centered
        size="md"
      >
        <Stack gap="lg">
          <Text>
            Are you sure you want to delete{" "}
            <Text component="span" fw={600}>
              {pendingDelete?.user.name.firstName} {pendingDelete?.user.name.lastName}
            </Text>{" "}
            from the application? This action will remove their access and cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setPendingDelete(null)} disabled={actionLoading}>
              CANCEL
            </Button>
            <Button color="red" onClick={handleConfirmDelete} loading={actionLoading}>
              DELETE
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}

function SortableHeader({ label, column }: { label: string; column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void } }) {
  const sorted = column.getIsSorted();
  return (
    <Group gap={4} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => column.toggleSorting(sorted === "asc")}>
      <Text size="sm" fw={600}>{label}</Text>
      {sorted === "asc" ? (
        <IconChevronUp size={14} />
      ) : sorted === "desc" ? (
        <IconChevronDown size={14} />
      ) : (
        <IconSelector size={14} style={{ opacity: 0.4 }} />
      )}
    </Group>
  );
}