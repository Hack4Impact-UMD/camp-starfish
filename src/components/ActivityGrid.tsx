import {
  Block,
  SchedulingSectionType,
  SectionSchedule,
  SectionScheduleID,
} from "@/types/sessionTypes";
import React, { useMemo } from "react";

import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { ActivityGridCell } from "./ActivityGridCell";

interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
}
export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
}) => {
  const data: Block<SchedulingSectionType>[] = useMemo(
    () => Object.values(sectionSchedule.blocks),
    [sectionSchedule.blocks]
  );
  console.log(data);
  const columns = useMemo<MRT_ColumnDef<Block<SchedulingSectionType>>[]>(
    () => [
      {
        accessorKey: "blocks",
        header: "",
        Cell: ({ row }) => (
          <ActivityGridCell
            block={row.original as Block<SchedulingSectionType>}
          />
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
  });
  return <MantineReactTable table={table} />;
};
