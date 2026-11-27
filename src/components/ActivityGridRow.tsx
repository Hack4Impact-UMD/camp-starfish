import { Block } from "@/types/scheduling/schedulingTypes";
import { SchedulingSection } from "@/types/sessions/sessionTypes";
import { AttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import { Text, ActionIcon, ScrollArea, Tooltip } from "@mantine/core";
import ActivityGridCell from "@/components/ActivityGridCell";
import { MdAdd, MdChevronLeft, MdChevronRight } from "react-icons/md";
import openCreateActivityModal from "@/features/scheduling/activityManagement/components/CreateActivityModal/CreateActivityModal";
import { UUIDV4 } from "@/types/utils/idTypes";
import { objectKeys } from "@/utils/types/typeUtils";

interface ActivityGridRowProps {
  block: Block;
  blockId: UUIDV4;
  index: string;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
  /**
   * Adding an activity writes straight to Firestore, so it would be invisible in an unsaved draft
   * and then erased when the draft is saved. Block it until the draft is saved or discarded.
   */
  isAddActivityDisabled: boolean;
}

export default function ActivityGridRow(props: ActivityGridRowProps) {
  const { block, blockId, index, section, attendeeGroups, isAddActivityDisabled } = props;
  return (
    <>
      <Text className="flex justify-center items-center w-full h-full p-0 border border-solid border-neutral-5 bg-neutral-2 text-sm font-semibold">
        Block {index}
      </Text>
      <Tooltip
        label="Save or discard your changes before adding activities"
        disabled={!isAddActivityDisabled}
      >
        {/* data-disabled (not disabled) so the tooltip still receives hover events */}
        <ActionIcon
          classNames={{
            root: "w-full h-full rounded-none border border-solid border-neutral-5",
          }}
          variant="subtle"
          size="xs"
          data-disabled={isAddActivityDisabled || undefined}
          aria-disabled={isAddActivityDisabled}
          onClick={() => {
            if (isAddActivityDisabled) return;
            openCreateActivityModal({ sessionId: section.sessionId, sectionId: section.id, blockId });
          }}
        >
          <MdAdd size={40} />
        </ActionIcon>
      </Tooltip>
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
        {objectKeys(block.activities).length === 0 ? (
          <Text className="p-2 text-sm italic">No activities scheduled</Text>
        ) : (
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${2 * objectKeys(block.activities).length}, max-content)`,
            }}
          >
            {objectKeys(block.activities).map((activityId, i) => {
              const activity = block.activities[activityId]
              return <div
                key={activityId}
                className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4"
                style={{ gridColumnStart: 2 * i + 1, gridColumnEnd: 2 * i + 3 }}
              >
                <ActivityGridCell
                  activity={activity}
                  activityId={activityId}
                  blockId={blockId}
                  section={section}
                  attendeeGroups={attendeeGroups}
                />
              </div>
            })}
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
