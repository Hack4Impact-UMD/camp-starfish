import { Block, SchedulingSectionType } from "@/types/sessionTypes";
import { Text, ActionIcon, ScrollArea } from "@mantine/core";
import ActivityGridCell from "./ActivityGridCell";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface ActivityGridRowProps {
  block: Block<SchedulingSectionType>;
  id: string;
}

export default function ActivityGridRow(props: ActivityGridRowProps) {
  const { block, id } = props;
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
        <MdChevronLeft size={40} />
      </ActionIcon>
      <ScrollArea type="scroll" className="w-full">
        <div
          className="grid gap-0"
          style={{ gridTemplateColumns: `repeat(${2 * block.activities.length}, max-content)` }}
        >
          {block.activities.map((activity, i) => (
            <div
              key={i}
              className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4"
              style={{ gridColumnStart: 2 * i + 1, gridColumnEnd: 2 * i + 3 }}
            >
              <ActivityGridCell activity={activity} />
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
        <MdChevronRight size={40} />
      </ActionIcon>
    </>
  );
}
