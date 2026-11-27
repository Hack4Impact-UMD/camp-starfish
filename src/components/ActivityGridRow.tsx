import { Block } from "@/types/scheduling/schedulingTypes";
import { SchedulingSection } from "@/types/sessions/sessionTypes";
import { AttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import {
  Text,
  ActionIcon,
  ScrollArea,
  Badge,
  Menu,
  Tooltip,
} from "@mantine/core";
import ActivityGridCell from "@/components/ActivityGridCell";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdEdit,
  MdMoreVert,
} from "react-icons/md";
import openCreateActivityModal from "@/features/scheduling/activityManagement/components/CreateActivityModal/CreateActivityModal";
import { UUIDV4 } from "@/types/utils/idTypes";
import { objectKeys } from "@/utils/types/typeUtils";
import moment from "moment";
import openEditBlockModal from "@/features/scheduling/blockManagement/components/EditBlockModal";
import openConfirmationModal from "./modals/ConfirmationModal";
import useDeleteBlock from "@/features/scheduling/blockManagement/hooks/useDeleteBlock";
import useNotifications from "@/features/notifications/useNotifications";

export const STRUCTURE_LOCKED_MESSAGE = "Save or discard your changes first";

interface ActivityGridRowProps {
  block: Block;
  blockId: UUIDV4;
  index: string;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
  /**
   * Adding activities and editing/deleting blocks write straight to Firestore, so while there's an
   * unsaved draft they'd be invisible (or reappear) and then be overwritten when the draft is saved.
   * Block them until the draft is saved or discarded.
   */
  isStructureLocked: boolean;
}

export default function ActivityGridRow(props: ActivityGridRowProps) {
  const { block, blockId, index, section, attendeeGroups, isStructureLocked } = props;

  const notifications = useNotifications();

  const deleteBlockMutation = useDeleteBlock();

  return (
    <>
      <div className="flex flex-col justify-center items-center w-full h-full pb-xs border border-solid border-neutral-5 bg-neutral-2">
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon
              size="xs"
              variant="subtle"
              classNames={{ root: "self-end" }}
              aria-label={`Block ${index} Options`}
            >
              <MdMoreVert />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {isStructureLocked && <Menu.Label>{STRUCTURE_LOCKED_MESSAGE}</Menu.Label>}
            <Menu.Item
              leftSection={<MdEdit />}
              disabled={isStructureLocked}
              onClick={() =>
                openEditBlockModal({
                  mode: "UPDATE",
                  sessionId: section.sessionId,
                  sectionId: section.id,
                  blockId,
                })
              }
              aria-label={`Edit Block ${index}`}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="error"
              leftSection={<MdDelete />}
              disabled={isStructureLocked}
              onClick={() =>
                openConfirmationModal({
                  title: `Are you sure you want to delete "Block ${index}"`,
                  message: "This will also delete all activities and preferences info associated with this block.",
                  onConfirm: () => deleteBlockMutation.mutate({ sessionId: section.sessionId, sectionId: section.id, blockId }, { onError: (error) => notifications.error(error.message, `Failed to delete "Block ${index}"`) })
                })
              }
              aria-label={`Delete Block ${index}`}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <div className="flex flex-col justify-center items-center grow">
          <Text className="text-sm font-semibold">Block {index}</Text>
          <Badge variant="subtle" size="md">
            <Text className="text-xs font-semibold">
              {`${moment(block.startTime).format("h:mm A")} - ${moment(block.endTime).format("h:mm A")}`}
            </Text>
          </Badge>
        </div>
      </div>

      <Tooltip label={STRUCTURE_LOCKED_MESSAGE} disabled={!isStructureLocked}>
        {/* data-disabled (not disabled) so the tooltip still receives hover events */}
        <ActionIcon
          classNames={{
            root: "w-full h-full rounded-none border border-solid border-neutral-5",
          }}
          variant="subtle"
          size="xs"
          data-disabled={isStructureLocked || undefined}
          aria-disabled={isStructureLocked}
          onClick={() => {
            if (isStructureLocked) return;
            openCreateActivityModal({
              sessionId: section.sessionId,
              sectionId: section.id,
              blockId,
            });
          }}
          aria-label={`Add Activity to Block ${index}`}
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
        aria-label={`Scroll Left on Block ${index} Activities`}
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
              const activity = block.activities[activityId];
              return (
                <div
                  key={activityId}
                  className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4"
                  style={{
                    gridColumnStart: 2 * i + 1,
                    gridColumnEnd: 2 * i + 3,
                  }}
                >
                  <ActivityGridCell
                    activity={activity}
                    activityId={activityId}
                    blockId={blockId}
                    section={section}
                    attendeeGroups={attendeeGroups}
                  />
                </div>
              );
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
        aria-label={`Scroll Right on Block ${index} Activities`}
      >
        <MdChevronRight size={40} />
      </ActionIcon>
    </>
  );
}
