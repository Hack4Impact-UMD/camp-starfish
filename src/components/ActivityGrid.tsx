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

type BlockWithId<T extends SchedulingSectionType> = Block<T> & {
  id: string;
};


interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
}
export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
}) => {
  const data = useMemo(
    () =>
      Object.entries(sectionSchedule.blocks).map(([id, block]) => ({
        ...block,
        id,
      })),
    [sectionSchedule.blocks]
  );
  console.log(data);
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
