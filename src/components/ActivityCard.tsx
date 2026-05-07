"use client";
import React from "react";
import { Text, Badge, UnstyledButton, Flex } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
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
    <div className="bg-white rounded-lg border border-solid border-gray-300 p-3 relative">
      {/* Header row */}
      <Flex align="center" gap="xs">
        {bundle && (
          <IconCircleFilled
            size={10}
            className={
              bundle.ageGroup === "OCP"
                ? "text-red-500"
                : "text-blue-500"
            }
          />
        )}

        <Text className="font-bold text-sm flex-grow text-center">
          {activity.name}
        </Text>

        {bundle && (
          <Badge
            size="xs"
            color={ageGroupColor[bundle.ageGroup]}
            variant="filled"
          >
            {bundle.ageGroup}
          </Badge>
        )}
      </Flex>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1.5" />

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