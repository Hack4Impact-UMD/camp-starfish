"use client";

import { ReactNode } from "react";
import { Box } from "@mantine/core";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import classNames from "classnames";
import { ActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { Attendee, SchedulingSection } from "@/types/sessions/sessionTypes";
import { isIndividualActivityAssignments } from "@/types/scheduling/schedulingTypeGuards";
import { getActivityName } from "@/types/scheduling/schedulingUtils";
import { getFullName } from "@/types/people/personUtils";
import {
  AttendeeGroups,
  getAttendeeName,
} from "@/features/scheduling/generation/schedulingUtils";
import { openActivityModal } from "@/components/ActivityModal";
import { UUIDV4 } from "@/types/utils/idTypes";
import {
  AssignmentField,
  getAssignmentItemId,
  getAssignmentListId,
  getAssignmentListType,
} from "@/features/scheduling/editing/moveAssignment";

interface ActivityGridCellProps {
  activity: ActivityWithAssignments;
  activityId: UUIDV4;
  blockId: UUIDV4;
  section: SchedulingSection;
  attendeeGroups: AttendeeGroups;
}

interface AssignmentListProps {
  blockId: UUIDV4;
  activityId: UUIDV4;
  field: AssignmentField;
  assigneeIds: number[];
  renderAssignee: (assigneeId: number) => ReactNode;
  itemClassName?: string;
}

function AssignmentList(props: AssignmentListProps) {
  const { blockId, activityId, field, assigneeIds, renderAssignee, itemClassName } = props;
  const location = { blockId, activityId, field };

  return (
    <Droppable
      droppableId={getAssignmentListId(location)}
      type={getAssignmentListType(blockId, field)}
    >
      {(droppableProvided, droppableSnapshot) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
          className={classNames("min-h-6 rounded-sm transition-colors", {
            "bg-blue-1": droppableSnapshot.isDraggingOver,
          })}
        >
          {assigneeIds.map((assigneeId, index) => (
            <Draggable
              key={assigneeId}
              draggableId={getAssignmentItemId(location, assigneeId)}
              index={index}
            >
              {(draggableProvided, draggableSnapshot) => (
                <div
                  ref={draggableProvided.innerRef}
                  {...draggableProvided.draggableProps}
                  {...draggableProvided.dragHandleProps}
                  className={classNames("px-1 rounded-sm cursor-grab hover:bg-neutral-2", itemClassName, {
                    "bg-white shadow-md": draggableSnapshot.isDragging,
                  })}
                >
                  {renderAssignee(assigneeId)}
                </div>
              )}
            </Draggable>
          ))}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

interface BunkRosterProps {
  bunkNum: number;
  attendeesByBunk: Record<number, Attendee[]>;
}

function BunkRoster(props: BunkRosterProps) {
  const { bunkNum, attendeesByBunk } = props;
  return (
    <div>
      <p className="font-semibold">Bunk {bunkNum}</p>
      <ul>
        {(attendeesByBunk[bunkNum] ?? []).map((attendee) => (
          <li key={attendee.attendeeId}>
            {getFullName(attendee.snapshot.name)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ActivityGridCell(props: ActivityGridCellProps) {
  const { activity, activityId, blockId, section, attendeeGroups } = props;
  const { campers, staff, admins, attendeesById, campersByBunk, staffByBunk } =
    attendeeGroups;

  const listProps = { blockId, activityId };
  const renderAttendeeName = (attendeeId: number) => getAttendeeName(attendeesById, attendeeId);
  const adminList = (
    <AssignmentList
      {...listProps}
      field="adminIds"
      assigneeIds={activity.adminIds}
      renderAssignee={renderAttendeeName}
      itemClassName="font-bold"
    />
  );

  return (
    <>
      <Box
        className="col-start-1 col-end-3 text-center font-bold bg-[#FFF7D5] p-[6px] text-[0.9rem] tracking-[0.3px] border border-[#001B2A] cursor-pointer"
        onClick={() =>
          openActivityModal({ section, blockId, activity, campers, staff, admins })
        }
      >
        {getActivityName(activity)}
      </Box>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? "CAMPERS" : "BUNKS"}
      </div>
      <div className="font-bold bg-[#DEE1E3] px-2 py-1 text-center border border-[#001B2A]">
        STAFF
      </div>
      <div className="px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? (
          <AssignmentList
            {...listProps}
            field="camperIds"
            assigneeIds={activity.camperIds}
            renderAssignee={renderAttendeeName}
          />
        ) : (
          <AssignmentList
            {...listProps}
            field="bunkNums"
            assigneeIds={activity.bunkNums}
            renderAssignee={(bunkNum) => (
              <BunkRoster bunkNum={bunkNum} attendeesByBunk={campersByBunk} />
            )}
          />
        )}
      </div>
      <div className="flex flex-col gap-1 px-2 py-1 text-[0.9rem] text-center border border-[#001B2A]">
        {isIndividualActivityAssignments(activity) ? (
          <AssignmentList
            {...listProps}
            field="staffIds"
            assigneeIds={activity.staffIds}
            renderAssignee={renderAttendeeName}
          />
        ) : (
          // Bunk staff move with their bunk, so they're shown here but dragged via the BUNKS column
          activity.bunkNums.map((bunkNum) => (
            <BunkRoster key={bunkNum} bunkNum={bunkNum} attendeesByBunk={staffByBunk} />
          ))
        )}
        {adminList}
      </div>
    </>
  );
}
