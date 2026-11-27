import { ActivityWithAssignments, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { UUIDV4 } from "@/types/utils/idTypes";

export const ASSIGNMENT_FIELDS = ["camperIds", "staffIds", "adminIds", "bunkNums"] as const;
export type AssignmentField = (typeof ASSIGNMENT_FIELDS)[number];

export interface AssignmentListLocation {
  blockId: UUIDV4;
  activityId: UUIDV4;
  field: AssignmentField;
}

export interface AssignmentPosition {
  listId: string;
  index: number;
}

const SEPARATOR = "|";

/** Droppable ID for one assignment list (e.g. the campers of one activity). */
export function getAssignmentListId({ blockId, activityId, field }: AssignmentListLocation): string {
  return [blockId, activityId, field].join(SEPARATOR);
}

/**
 * Droppable type for an assignment list. Items can only be dropped into lists of the same type,
 * so assignees can only move between activities in the same block, and only into a list for the same role.
 */
export function getAssignmentListType(blockId: UUIDV4, field: AssignmentField): string {
  return [blockId, field].join(SEPARATOR);
}

/** Draggable ID for one assignee. Must be unique across the whole grid. */
export function getAssignmentItemId(location: AssignmentListLocation, assigneeId: number): string {
  return [getAssignmentListId(location), assigneeId].join(SEPARATOR);
}

export function parseAssignmentListId(listId: string): AssignmentListLocation | null {
  const [blockId, activityId, field] = listId.split(SEPARATOR);
  if (!blockId || !activityId || !ASSIGNMENT_FIELDS.includes(field as AssignmentField)) {
    return null;
  }
  // IDs come from our own droppable IDs, so cast rather than validate (asUUID would throw on non-UUID keys)
  return { blockId: blockId as UUIDV4, activityId: activityId as UUIDV4, field: field as AssignmentField };
}

function getAssignmentList(activity: ActivityWithAssignments | undefined, field: AssignmentField): number[] | undefined {
  const list = (activity as Partial<Record<AssignmentField, number[]>> | undefined)?.[field];
  return Array.isArray(list) ? list : undefined;
}

/**
 * Returns a copy of the schedule with one assignee moved from the source list to the destination list.
 * Returns the original schedule unchanged if the move is invalid
 * (different block or role, unknown list, or the assignee is already in the destination activity).
 */
export function moveAssignment(schedule: SectionSchedule, source: AssignmentPosition, destination: AssignmentPosition): SectionSchedule {
  const from = parseAssignmentListId(source.listId);
  const to = parseAssignmentListId(destination.listId);
  if (!from || !to || from.blockId !== to.blockId || from.field !== to.field) {
    return schedule;
  }

  const { blockId, field } = from;
  const block = schedule.blocks[blockId];
  const fromActivity = block?.activities[from.activityId];
  const toActivity = block?.activities[to.activityId];
  const fromList = getAssignmentList(fromActivity, field);
  const toList = getAssignmentList(toActivity, field);
  if (!fromList || !toList) {
    return schedule;
  }

  const isSameActivity = from.activityId === to.activityId;
  if (isSameActivity && source.index === destination.index) {
    return schedule;
  }

  const newFromList = [...fromList];
  const [assigneeId] = newFromList.splice(source.index, 1);
  if (assigneeId === undefined) {
    return schedule;
  }

  let updatedActivities: Record<UUIDV4, ActivityWithAssignments>;
  if (isSameActivity) {
    newFromList.splice(destination.index, 0, assigneeId);
    updatedActivities = { [from.activityId]: { ...fromActivity, [field]: newFromList } as ActivityWithAssignments };
  } else {
    if (toList.includes(assigneeId)) {
      return schedule;
    }
    const newToList = [...toList];
    newToList.splice(destination.index, 0, assigneeId);
    updatedActivities = {
      [from.activityId]: { ...fromActivity, [field]: newFromList } as ActivityWithAssignments,
      [to.activityId]: { ...toActivity, [field]: newToList } as ActivityWithAssignments,
    };
  }

  return {
    ...schedule,
    blocks: {
      ...schedule.blocks,
      [blockId]: {
        ...block,
        activities: { ...block.activities, ...updatedActivities },
      },
    },
  } as SectionSchedule;
}
