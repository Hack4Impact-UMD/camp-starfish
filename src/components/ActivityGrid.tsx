"use client";

import {
  Block,
  SchedulingSectionType,
  SectionScheduleID,
} from "@/types/sessionTypes";
import React, { useMemo, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import { ActivityGridCell } from "./ActivityGridCell";

import {
  Box,
  Button,
  Container,
  Flex,
  ScrollArea,
  Select,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

type BlockWithId<T extends SchedulingSectionType> = Block<T> & {
  id: string;
};

interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
  isGenerated: boolean;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
  isGenerated,
}) => {
  const theme = useMantineTheme();


  const [view, setView] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const data = useMemo(() => {
    let arr = Object.entries(sectionSchedule.blocks).map(([id, block]) => ({
      ...block,
      id,
    }));

    // keep your view toggle logic
    if (view) return arr;

    // manual sorting (custom)
    if (sortFilter) {
      arr = [...arr];
      arr.sort((a, b) => {
        const aName = a.activities[0]?.name?.toLowerCase() ?? "";
        const bName = b.activities[0]?.name?.toLowerCase() ?? "";

        switch (sortFilter) {
          case "firstNameAZ":
            return aName.localeCompare(bName);
          case "firstNameZA":
            return bName.localeCompare(aName);
          default:
            return 0;
        }
      });
    }

    return arr;
  }, [sectionSchedule.blocks, view, sortFilter]);

  const columns = useMemo<ColumnDef<BlockWithId<SchedulingSectionType>>[]>(
    () => [
      {
        id: "blocks",
        header: "",
        cell: ({ row }) => (
          <ActivityGridCell
            block={row.original as Block<SchedulingSectionType>}
            id={row.original.id}
            isGenerated={isGenerated}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // -------------------------
  // Filter UI Logic
  // -------------------------
  const handleViewChange = (value: string | null) =>
    setView(value === view ? null : value);

  const handleSortFilter = (value: string | null) =>
    setSortFilter(value === sortFilter ? null : value);

  const handleClearFilters = () => {
    setView(null);
    setSortFilter(null);
    setGlobalFilter("");
  };

  const filtersActive = !!view || !!sortFilter || !!globalFilter;


  return (
    <Container style={{ 
      border: `1px solid ${theme.colors["neutral"][5]}`,  
      padding: "1rem"}} className = "min-w-full">
      <Flex direction="column" mt="md">
        {/* Toolbar */}
        <Box style={{ backgroundColor: theme.colors["neutral"][3] }}>
          <Flex direction="row" gap="md" p="md" align="center">
            <Select
              value={view}
              onChange={handleViewChange}
              placeholder="View:"
              data={[{ value: "scheduleView", label: "Schedule View" }]}
            />

            <Select
              value={sortFilter}
              onChange={handleSortFilter}
              placeholder="Sort By:"
              data={[
                { value: "firstNameAZ", label: "First Name (A → Z)" },
                { value: "firstNameZA", label: "First Name (Z → A)" },
              ]}
            />

            <TextInput
              placeholder="Search…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: 200 }}
            />

            {filtersActive && (
              <Button color="red" variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Flex>
        </Box>

        {/* Table */}
        <Box>
          <ScrollArea>
            <table
              style={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: 0,
                          overflow: "visible",
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Box>

        {/* Pagination */}
        <Flex justify="flex-start" p="md">
          <Button
            variant="subtle"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>

          <Button
            variant="subtle"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};
