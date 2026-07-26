import { Block } from "@/types/scheduling/schedulingTypes";
import { SchedulingSection } from "@/types/sessions/sessionTypes";
import { AttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import { Text, ActionIcon, ScrollArea } from "@mantine/core";
import ActivityGridCell from "@/components/ActivityGridCell";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface ActivityGridRowProps {
  block: Block;
  id: string;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
}

export default function ActivityGridRow(props: ActivityGridRowProps) {
  const { block, id, section, attendeeGroups } = props;
  return (
    <>
      <Text className="flex justify-center items-center w-full h-full p-0 border border-solid border-neutral-5 bg-neutral-2 text-sm font-semibold">
        Block {id}
      </Text>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <MdChevronLeft size={40} />
      </ActionIcon>
      <ScrollArea type="scroll" className="w-full">
        {block.activities.length === 0 ? (
          <Text className="p-2 text-sm italic">No activities scheduled</Text>
        ) : (
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${2 * block.activities.length}, max-content)`,
            }}
          >
            {block.activities.map((activity, i) => (
              <div
                key={i}
                className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4"
                style={{ gridColumnStart: 2 * i + 1, gridColumnEnd: 2 * i + 3 }}
              >
                <ActivityGridCell
                  activity={activity}
                  blockId={id}
                  section={section}
                  attendeeGroups={attendeeGroups}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <MdChevronRight size={40} />
      </ActionIcon>
    </>
  );
}
