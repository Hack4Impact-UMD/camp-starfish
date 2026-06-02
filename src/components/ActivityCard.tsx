"use client";
import React from "react";
import { Text, Badge, UnstyledButton, Flex } from "@mantine/core";
import { MdCircle } from "react-icons/md";
import {
  ActivityWithAssignments,
  BundleActivityWithAssignments,
} from "@/types/scheduling/schedulingTypes";
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

// Type guard
function isBundleActivity(
  activity: ActivityWithAssignments
): activity is BundleActivityWithAssignments {
  return "ageGroup" in activity;
}

export default function ActivityCard({
  activity,
  blockId,
  onEditActivity,
}: ActivityCardProps) {
  const bundle = isBundleActivity(activity) ? activity : null;

  return (
    <div className="bg-white rounded-[10px] border border-solid border-[#9dafb8] p-3 relative">
      {/* Top: event category (falls back to the name when there is no category).
          The dot and badge are absolutely positioned so the text stays centered
          across the full card width, in line with the title/description below. */}
      <div className="relative flex items-center min-h-[18px]">
        {bundle && (
          <MdCircle
            size={10}
            className={`absolute left-0 top-1/2 -translate-y-1/2 ${
              bundle.ageGroup === "OCP" ? "text-red-500" : "text-blue-500"
            }`}
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