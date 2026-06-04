"use client";
import { Text, Badge, UnstyledButton, Flex } from "@mantine/core";
import { MdCircle } from "react-icons/md";
import { ActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { isBundleActivityWithAssignments } from "@/types/scheduling/schedulingTypeGuards";
import { AgeGroup } from "@/types/sessions/sessionTypes";

interface ActivityCardProps {
  activity: ActivityWithAssignments;
  blockId: string;
  onEditActivity: (blockId: string, activity: ActivityWithAssignments) => void;
}

const ageGroupColor = {
  OCP: "red",
  NAV: "blue",
} satisfies Record<AgeGroup, string>;

const CATEGORY_DOT_COLORS = [
  "#ef4444", "#3b82f6", "#22c55e", "#f97316",
  "#a855f7", "#14b8a6", "#f59e0b", "#ec4899",
];

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) & 0xffff;
  }
  return CATEGORY_DOT_COLORS[hash % CATEGORY_DOT_COLORS.length];
}

export default function ActivityCard({
  activity,
  blockId,
  onEditActivity,
}: ActivityCardProps) {
  const bundle = isBundleActivityWithAssignments(activity) ? activity : null;

  return (
    <div className="bg-white rounded-[10px] border border-solid border-blue-2 p-3 relative">
      {/* Top: event category (falls back to the name when there is no category).
          The dot and badge are absolutely positioned so the text stays centered
          across the full card width, in line with the title/description below. */}
      <div className="relative flex items-center min-h-[18px]">
        {bundle && (
          <MdCircle
            size={10}
            style={{ color: getCategoryColor(bundle.programAreaId) }}
            className="absolute left-0 top-1/2 -translate-y-1/2"
          />
        )}

        <Text className="font-bold text-sm w-full text-center">
          {bundle ? bundle.programAreaId : activity.name}
        </Text>

        {bundle && (
          <Badge
            size="xs"
            color={ageGroupColor[bundle.ageGroup]}
            variant="filled"
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            {bundle.ageGroup}
          </Badge>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1.5" />

      {/* Below the divider: activity title (bundle only — jamboree shows it above) */}
      {bundle && (
        <Text className="font-semibold text-sm text-center">
          {activity.name}
        </Text>
      )}

      {/* Description */}
      <Text className="text-xs text-gray-600 text-center">
        {activity.description}
      </Text>

      {/* Edit */}
      <Flex justify="flex-end" className="mt-1">
        <UnstyledButton onClick={() => onEditActivity(blockId, activity)}>
          <Text className="text-xs text-gray-500">Edit</Text>
        </UnstyledButton>
      </Flex>
    </div>
  );
}