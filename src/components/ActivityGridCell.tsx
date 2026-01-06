import { Block, SchedulingSectionType } from "@/types/sessionTypes";
import {
  Text,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import React from "react";
import { ActivityCard } from "./ActivityCard";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface ActivityGridCellProps {
  block: Block<SchedulingSectionType>;
  id: string;
}

export const ActivityGridCell: React.FC<ActivityGridCellProps> = ({
  block,
  id,
}) => {

  return (
    <>
      <Text className="flex justify-center items-center w-full h-full p-0 border-[1px] border-solid border-neutral-5 bg-neutral-2 text-sm font-semibold">
        Block {id}
      </Text>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <IconChevronLeft size={24} />
      </ActionIcon>
      <ScrollArea type="scroll" className="w-full">
        <div className="grid gap-0" style={{ gridColumn: 2 * block.activities.length }}>
          {block.activities.map((activity, i) => (
            <div key={i} className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4" style={{ gridColumnStart: 2 * i + 1, gridColumnEnd: 2 * i + 3 }}>
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      </ScrollArea>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <IconChevronRight size={24} />
      </ActionIcon>
    </>
  );
};
