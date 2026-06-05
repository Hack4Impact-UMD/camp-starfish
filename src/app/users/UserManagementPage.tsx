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
  Box,
  Button,
  Group,
  Paper,
  Radio,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  ScrollArea,
  Badge,
  ActionIcon,
  Flex,
  UnstyledButton,
} from "@mantine/core";
import { MdSearch, MdDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { User, Role } from "@/types/users/userTypes";
import { useAuth } from "@/auth/useAuth";
import useDeleteUser from "@/hooks/users/useDeleteUser";
import { openDeleteUserModal } from "./userModals";
import { ALL_ROLES } from "@/types/users/userUtils";
import { toNormalCase } from "@/utils/stringUtils";

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "error",
  STAFF: "blue",
  PHOTOGRAPHER: "aqua",
  PARENT: "green",
  CAMPER: "orange",
};

interface UserManagementPageProps {
  users: User[];
}

export default function UserManagementPage({ users }: UserManagementPageProps) {
  const { token } = useAuth();
  // `campminderId` is set as a custom claim at account creation and equals the user's id.
  const currentUserId = token?.claims.campminderId as number | undefined;

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
      header: "FIRST NAME",
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "lastName",
      accessorFn: (row) => row.name.lastName,
      header: "LAST NAME",
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "email",
      accessorFn: (row) => row.email ?? "",
      header: "EMAIL",
      cell: (info) => <Text size="sm">{info.getValue<string>() || "—"}</Text>,
    },
    {
      id: "role",
      accessorFn: (row) => row.role,
      header: "ROLE",
      cell: (info) => {
        const role = info.getValue<Role>();
        return (
          <Badge color={ROLE_COLORS[role]} variant="light" radius="sm">
            {toNormalCase(role)}
          </Badge>
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
          <ActionIcon
            color="red"
            variant="subtle"
            aria-label="Delete user"
            disabled={isSelf}
            title={isSelf ? "You cannot delete your own account" : undefined}
            onClick={() => openDeleteUserModal({ user, onConfirm: () => deleteUserById(user.id) })}
          >
            <MdDelete size={18} />
          </ActionIcon>
        );
      },
      enableSorting: false,
    },
  ], [currentUserId, deleteUserById]);

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
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  const sortValue = sorting[0]?.id ?? "";
  const hasFilters = !!globalFilter || !!roleFilter;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-12 py-8">
        {/* Header with accent underline */}
        <Box mb="xl">
          <Title order={1} className="font-lato font-bold">
            User Management
          </Title>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="332"
            height="6"
            viewBox="0 0 332 6"
            fill="none"
            aria-hidden="true"
            className="mt-1.5 block h-auto max-w-full"
          >
            <path
              d="M331.982 3.30795C325.855 3.93247 320.001 4.70093 314.025 5.08908C308.076 5.47451 302.014 5.54648 295.991 5.63482C286.573 5.77296 277.147 5.83674 267.723 5.87869C259.461 5.91553 251.197 5.86368 242.933 5.87869C238.544 5.88722 234.15 6.05878 229.775 5.97658C220.304 5.7999 210.847 5.48849 201.378 5.2702C194.812 5.11876 188.232 5.07271 181.665 4.90558C173.012 4.68626 164.374 4.3653 155.722 4.14224C150.315 4.00239 144.889 4.00921 139.482 3.86425C131.689 3.65449 123.906 3.33796 116.11 3.12001C107.942 2.89182 99.7694 2.66432 91.5905 2.55176C83.6389 2.44159 75.6754 2.44398 67.7166 2.45558C60.0216 2.46683 52.3254 2.52823 44.6331 2.60941C36.2813 2.69854 27.9308 2.81485 19.5816 2.95833C14.7481 3.03951 9.92053 3.22847 5.08509 3.27486C3.29579 3.29226 1.21111 3.34751 0.216905 2.35939C-0.490433 1.6554 0.590222 0.881478 2.29962 0.858625C13.0217 0.710936 23.7431 0.537666 34.4671 0.408395C39.8638 0.343589 45.2671 0.371558 50.6638 0.322783C62.2268 0.217047 73.7879 0.0141025 85.3509 0.000118045C91.36 -0.00704471 97.3671 0.313574 103.376 0.467061C111.792 0.682285 120.208 0.874656 128.627 1.08101C133.715 1.20789 138.801 1.35217 143.887 1.47633C149.995 1.62504 156.101 1.75874 162.208 1.90302C168.19 2.04389 174.17 2.20215 180.154 2.33074C190.332 2.54938 200.507 2.78882 210.689 2.94913C221.426 3.11796 232.171 3.27179 242.912 3.30863C253.915 3.34615 264.918 3.24041 275.925 3.18959C281.485 3.16435 287.049 3.16776 292.605 3.08112C298.272 2.99381 303.952 2.90444 309.588 2.64488C313.829 2.4491 317.986 1.90336 322.221 1.66733C324.599 1.57717 326.988 1.61822 329.349 1.78978C331.212 1.8945 332.146 2.47979 331.981 3.3059"
              fill="var(--mantine-color-orange-5)"
            />
          </svg>
          <Text c="dimmed" size="md" mt="md">
            Control access, assign roles, and monitor activity
          </Text>
        </Box>

        {/* Toolbar + table card */}
        <Paper withBorder radius="lg" shadow="xs" p="lg">
          {/* Search & Filter Bar */}
          <Flex justify="space-between" align="center" gap="md" mb="lg" wrap="wrap">
            <Group gap="lg" wrap="wrap">
              <TextInput
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                leftSection={<MdSearch size={16} />}
                w={280}
              />
              <Radio.Group value={roleFilter ?? ""} onChange={(v) => setRoleFilter(v || null)} aria-label="Filter by role">
                <Group gap="md">
                  <Radio value="" label="All" />
                  {ALL_ROLES.map((r) => (
                    <Radio key={r} value={r} label={toNormalCase(r)} />
                  ))}
                </Group>
              </Radio.Group>
            </Group>
            <Group gap="sm">
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Sort by
                </Text>
                <Select
                  aria-label="Sort by"
                  data={[
                    { value: "", label: "None" },
                    { value: "firstName", label: "First Name" },
                    { value: "lastName", label: "Last Name" },
                    { value: "email", label: "Email" },
                  ]}
                  value={sortValue}
                  onChange={(v) => setSorting(v ? [{ id: v, desc: false }] : [])}
                  w={150}
                  allowDeselect={false}
                />
              </Group>
              {hasFilters && (
                <Button
                  variant="light"
                  color="red"
                  onClick={() => {
                    setGlobalFilter("");
                    setRoleFilter(null);
                  }}
                >
                  Clear
                </Button>
              )}
            </Group>
          </Flex>

          {/* Table */}
          <ScrollArea>
            <Table
              striped={false}
              highlightOnHover
              withTableBorder
              withColumnBorders
              verticalSpacing="sm"
              className="[&_td]:text-center [&_th]:text-center"
            >
              <Table.Thead className="bg-[var(--mantine-color-gray-1)]">
                {table.getHeaderGroups().map((hg) => (
                  <Table.Tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <Table.Th key={header.id} className="whitespace-nowrap">
                        <Text size="sm" fw={600}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
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
          <Flex align="center" justify="space-between" mt="lg" gap="sm" wrap="wrap">
            <Box w={180} visibleFrom="sm" />
            <Group gap="md" justify="center">
              <UnstyledButton
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MdChevronLeft size={18} />
                Previous
              </UnstyledButton>
              <Box className="rounded-md border border-[var(--mantine-color-gray-3)]" px="sm" py={4}>
                <Text size="sm" fw={600}>
                  {pageIndex + 1}
                </Text>
              </Box>
              <UnstyledButton
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <MdChevronRight size={18} />
              </UnstyledButton>
            </Group>
            <Text size="sm" c="dimmed" w={180} ta="right">
              {totalRows === 0 ? "No entries" : `Showing ${start}–${end} out of ${totalRows} entries`}
            </Text>
          </Flex>
        </Paper>
      </div>
    </div>
  );
}
