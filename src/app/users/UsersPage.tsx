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
  Breadcrumbs,
  Anchor,
  Tooltip,
} from "@mantine/core";
import {
  MdSearch,
  MdDelete,
  MdChevronLeft,
  MdChevronRight,
  MdUploadFile,
} from "react-icons/md";
import { User, Role } from "@/types/users/userTypes";
import { useAuth } from "@/auth/useAuth";
import useDeleteUser from "@/hooks/users/useDeleteUser";
import openConfirmationModal from "@/components/modals/ConfirmationModal";
import { ALL_ROLES, getFullName } from "@/types/users/userUtils";
import { toNormalCase } from "@/utils/stringUtils";
import useUserList from "@/hooks/users/useUserList";
import LoadingPage from "../loading";
import ErrorPage from "../error";
import openUploadUsersCsvModal from "@/components/UploadUsersCsvModal/UploadUsersCsvModal";

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "error",
  STAFF: "blue",
  PHOTOGRAPHER: "aqua",
  PARENT: "green",
  CAMPER: "orange",
};

export default function UsersPage() {
  const usersQuery = useUserList();
  switch (usersQuery.status) {
    case "pending":
      return <LoadingPage />;
    case "error":
      return <ErrorPage error={new Error("Error loading users")} />;
    case "success":
      return <UsersPageContent users={usersQuery.data} />;
  }
}

interface UsersPageContentProps {
  users: User[];
}

export function UsersPageContent({ users }: UsersPageContentProps) {
  const { token } = useAuth();
  // `campminderId` is set as a custom claim at account creation and equals the user's id.
  const currentUserId = token?.claims.campminderId as number | undefined;

  const { mutate: deleteUserById } = useDeleteUser();

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "firstName", desc: false },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const data = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
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
        accessorFn: (row) => ("email" in row ? row.email : "N/A"),
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
      // {
      //   id: "actions",
      //   header: "ACTIONS",
      //   cell: (info) => {
      //     const user = info.row.original;
      //     const isSelf =
      //       currentUserId !== undefined && currentUserId === user.id;
      //     return (
      //       <ActionIcon
      //         color="red"
      //         variant="subtle"
      //         aria-label="Delete user"
      //         disabled={isSelf}
      //         title={isSelf ? "You cannot delete your own account" : undefined}
      //         onClick={() =>
      //           openConfirmationModal({
      //             title: `Delete User "${getFullName(user.name)}"?`,
      //             onConfirm: () => deleteUserById({ userId: user.id }),
      //           })
      //         }
      //       >
      //         <MdDelete size={18} />
      //       </ActionIcon>
      //     );
      //   },
      //   enableSorting: false,
      // },
    ],
    [currentUserId, deleteUserById],
  );

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
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex flex-col gap-xs">
        <Breadcrumbs separator=">>">
          {[{ title: "USERS", href: "/users" }].map((breadcrumb) => (
            <Anchor href={breadcrumb.href} key={breadcrumb.title}>
              <Title order={6}>{breadcrumb.title}</Title>
            </Anchor>
          ))}
        </Breadcrumbs>
        <div className="flex items-center justify-between">
          <Title order={1}>Users</Title>
          <Tooltip label="Upload Users CSV">
            <ActionIcon color="aqua" onClick={() => openUploadUsersCsvModal()}>
              <MdUploadFile size={30} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <Paper withBorder radius="lg" shadow="xs" p="lg">
        <Flex
          justify="space-between"
          align="center"
          gap="md"
          mb="lg"
          wrap="wrap"
        >
          <Group gap="lg" wrap="wrap">
            <TextInput
              placeholder="Search users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              leftSection={<MdSearch size={16} />}
              w={280}
            />
            <Radio.Group
              value={roleFilter ?? ""}
              onChange={(v) => setRoleFilter(v || null)}
              aria-label="Filter by role"
            >
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
                  { value: "firstName", label: "First Name" },
                  { value: "lastName", label: "Last Name" },
                  { value: "email", label: "Email" },
                ]}
                defaultValue={"firstName"}
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
            <Table.Thead className="bg-gray-1">
              {table.getHeaderGroups().map((hg) => (
                <Table.Tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <Table.Th key={header.id} className="whitespace-nowrap">
                      <Text size="sm" fw={600}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={columns.length}
                    className="text-center p-8"
                  >
                    <Text c="dimmed">No users found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Table.Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        <Flex
          align="center"
          justify="space-between"
          mt="lg"
          gap="sm"
          wrap="wrap"
        >
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
            <Box className="rounded-md border bg-gray-3" px="sm" py={4}>
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
            {totalRows === 0
              ? "No entries"
              : `Showing ${start}–${end} out of ${totalRows} entries`}
          </Text>
        </Flex>
      </Paper>
    </div>
  );
}
