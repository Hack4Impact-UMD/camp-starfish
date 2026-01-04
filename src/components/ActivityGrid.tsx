"use client";

import {
  Block,
  SchedulingSectionType,
  SectionScheduleID,
} from "@/types/sessionTypes";
import React, { useState } from "react";

import { ActivityGridCell } from "./ActivityGridCell";

import {
  Box,
  Button,
  Container,
  Flex,
  ScrollArea,
  Select,
  Table,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
}) => {
  const theme = useMantineTheme();

  // -------------------------
  // Component State
  // -------------------------
  const [view, setView] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

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

  // -------------------------
  // Render
  // -------------------------
  return (
    <Container style={{ border: `1px solid ${theme.colors["neutral"][5]}` }}>
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
          <ScrollArea className="border-red-500 border-4">
            <Table
              style={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
              }}
            >
              <Table.Tbody>
                {Object.entries(sectionSchedule)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([blockId, block]) => (
                    <ActivityGridCell
                      key={blockId}
                      id={blockId}
                      block={block}
                    />
                  ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>
      </Flex>
    </Container>
  );
};
