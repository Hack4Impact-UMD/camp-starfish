import { Block } from "@/types/scheduling/schedulingTypes";
import { SchedulingSection } from "@/types/sessions/sessionTypes";
import { AttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import {
  Text,
  ActionIcon,
  ScrollArea,
  Badge,
  Button,
  Menu,
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

interface ActivityGridRowProps {
  block: Block;
  blockId: UUIDV4;
  index: string;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
}

export default function ActivityGridRow(props: ActivityGridRowProps) {
  const { block, blockId, index, section, attendeeGroups } = props;

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
            >
              <MdMoreVert />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<MdEdit />}
              onClick={() =>
                openEditBlockModal({
                  mode: "UPDATE",
                  sessionId: section.sessionId,
                  sectionId: section.id,
                  blockId,
                })
              }
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="error"
              leftSection={<MdDelete />}
              onClick={() =>
                openConfirmationModal({
                  title: `Are you sure you want to delete "Block ${index}"`,
                  onConfirm: () => deleteBlockMutation.mutateAsync({ sessionId: section.sessionId, sectionId: section.id, blockId })
                })
              }
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

      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
        onClick={() =>
          openCreateActivityModal({
            sessionId: section.sessionId,
            sectionId: section.id,
            blockId,
          })
        }
      >
        <MdAdd size={40} />
      </ActionIcon>
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
              const activity = block.activities[activityId];
              return (
                <div
                  key={i}
                  className="grid grid-cols-subgrid grid-rows-subgrid row-start-1 row-end-4"
                  style={{
                    gridColumnStart: 2 * i + 1,
                    gridColumnEnd: 2 * i + 3,
                  }}
                >
                  <ActivityGridCell
                    activity={activity}
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
      >
        <MdChevronRight size={40} />
      </ActionIcon>
    </>
  );
}
