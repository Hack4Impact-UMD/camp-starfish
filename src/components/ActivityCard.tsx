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
  // Category name -> dot color, so cards with the same category share a color
  // and different categories get distinct colors (see getCategoryColors).
  categoryColors?: Record<string, string>;
}

const ageGroupColor = {
  OCP: "red",
  NAV: "blue",
} satisfies Record<AgeGroup, string>;

const DOT_SATURATION = 65;
const DOT_LIGHTNESS = 45;
// Golden-angle hue step spreads sequential categories as far apart as possible.
const GOLDEN_ANGLE = 137.508;

/**
 * Assigns each distinct category an evenly-spaced, deterministic dot color.
 * Same name -> same color; different names -> maximally-separated hues. Sorting
 * keeps the assignment stable regardless of the input order.
 */
export function getCategoryColors(categories: string[]): Record<string, string> {
  const unique = [...new Set(categories)].sort();
  const colors: Record<string, string> = {};
  unique.forEach((name, index) => {
    const hue = Math.round((index * GOLDEN_ANGLE) % 360);
    colors[name] = `hsl(${hue}, ${DOT_SATURATION}%, ${DOT_LIGHTNESS}%)`;
  });
  return colors;
}

// Fallback for a category not present in the provided map (e.g. a soft-deleted
// program area still referenced by an activity): a stable hue from the name.
function fallbackCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${DOT_SATURATION}%, ${DOT_LIGHTNESS}%)`;
}

export default function ActivityCard({
  activity,
  blockId,
  onEditActivity,
  categoryColors,
}: ActivityCardProps) {
  const bundle = isBundleActivityWithAssignments(activity) ? activity : null;
  const dotColor = bundle
    ? categoryColors?.[bundle.programAreaId] ??
      fallbackCategoryColor(bundle.programAreaId)
    : undefined;

  return (
    <div className="bg-white rounded-[10px] border border-solid border-blue-2 p-3 relative">
      {/* Top: event category (falls back to the name when there is no category).
          The dot and badge are absolutely positioned so the text stays centered
          across the full card width, in line with the title/description below. */}
      <div className="relative flex items-center min-h-[18px]">
        {bundle && (
          <MdCircle
            size={10}
            style={{ color: dotColor }}
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