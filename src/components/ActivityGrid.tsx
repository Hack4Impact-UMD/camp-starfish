import {
  Block,
  SchedulingSectionType,
  SectionScheduleID,
} from "@/types/sessionTypes";
import React, { useMemo, useState } from "react";

import {
  MantineReactTable,
  MRT_GlobalFilterTextInput,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { ActivityGridCell } from "./ActivityGridCell";
import {
  Box,
  Button,
  Container,
  Flex,
  ScrollArea,
  Select,
  Text,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type BlockWithId<T extends SchedulingSectionType> = Block<T> & {
  id: string;
};

interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
}
export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
}) => {
  const theme = useMantineTheme();

  // states
  const [view, setView] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>(null);

  const data = useMemo(() => {
    let arr = Object.entries(sectionSchedule.blocks).map(([id, block]) => ({
      ...block,
      id,
    }));

    if (view) {
      return arr;
    }

    // sort filtering
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

  const columns = useMemo<MRT_ColumnDef<BlockWithId<SchedulingSectionType>>[]>(
    () => [
      {
        accessorKey: "blocks",
        header: "",
        Cell: ({ row }) => (
          <ActivityGridCell
            block={row.original as Block<SchedulingSectionType>}
            id={row.original.id}
          />
        ),
        mantineTableBodyCellProps: {
          style: {
            display: "block",
            width: "100%",
            padding: 0,
            overflow: "visible", // Allow carousel to overflow
          },
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableSorting: false,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    initialState: {
      showGlobalFilter: true,
    },
    mantineTableBodyCellProps: {
      style: {
        display: "block",
        width: "100%",
        padding: 0,
        overflow: "visible", // Allow carousel to overflow
      },
    },
    mantineTableBodyRowProps: {
      style: {
        display: "block",
        width: "100%",
      },
    },
    mantineTableProps: {
      style: {
        tableLayout: "fixed", // Fix table layout
        width: "100%",
      },
    },
  });

  //filter handling functions
  const handleViewChange = (value: string | null) => {
    const newValue = view === value ? null : value;
    setView(newValue);
  };

  const handleSortFilter = (value: string | null) => {
    const newValue = sortFilter === value ? null : value;
    setSortFilter(newValue);
  };

  const handleClearFilters = () => {
    setView(null);
    setSortFilter(null);
    table.setGlobalFilter("");
  };

  const filtersActive =
    !!view || !!sortFilter || !!table.getState().globalFilter;

  return (
    <Container
      style={{
        border: `1px solid ${theme.colors["neutral"][5]}`,
      }}
    >
      <Flex direction={"column"} mt={"md"}>
        <Box
          style={{
            backgroundColor: theme.colors["neutral"][3],
          }}
        >
          <Flex direction={"row"} gap={"md"} align={"center"} p={"md"}>
            <Box>
              <Select
                value={view}
                onChange={handleViewChange}
                placeholder="Sort By: "
                data={[{ value: "scheduleView", label: "Schedule View" }]}
              />
            </Box>
            <Box>
              <Select
                value={sortFilter}
                onChange={handleSortFilter}
                placeholder="Sort By: "
                data={[
                  { value: "firstNameAZ", label: "First Name (A → Z)" },
                  { value: "firstNameZA", label: "First Name (Z → A)" },
                  { value: "lastNameAZ", label: "Last Name (A → Z)" },
                  { value: "lastNameZA", label: "Last Name (Z → A)" },
                ]}
              />
            </Box>
            <Box>
              <Select
                placeholder="0 Filters Applied "
                data={["React", "Angular", "Vue", "Svelte"]}
              />
            </Box>
            <Box>
              <MRT_GlobalFilterTextInput table={table} />
            </Box>
            {filtersActive && (
              <Button color="red" variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Flex>
        </Box>
        <MRT_TableContainer table={table} />
        <Box>
          <Flex justify="flex-start">
            <MRT_TablePagination table={table} />
          </Flex>
          <Box style={{ display: "grid", width: "100%" }}>
            <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};
