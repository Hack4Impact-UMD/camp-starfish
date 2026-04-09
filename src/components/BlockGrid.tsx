"use client";

import React from "react";
import { Text, ActionIcon, Badge, UnstyledButton, Flex } from "@mantine/core";
import { IconPlus, IconCircleFilled } from "@tabler/icons-react";
import { BundleActivity, JamboreeActivity } from "@/types/scheduling/schedulingTypes";

export interface BlockActivity {
  id: string;
  name: string;
  description: string;
  ageGroup?: "OCP" | "NAV";
  programAreaId?: string;
}

export interface Block {
  id: string;
  label: string;
  activities: BlockActivity[];
}

interface BlockGridProps {
  blocks: Block[];
  onAddActivity: (blockId: string) => void;
  onEditActivity: (blockId: string, activity: BundleActivity | JamboreeActivity) => void;
}

const ageGroupColor: Record<string, string> = {
  OCP: "red",
  NAV: "blue",
};

export default function BlockGrid({ blocks, onAddActivity, onEditActivity }: BlockGridProps) {
  return (
    <div
      className="grid gap-0"
      style={{ gridTemplateColumns: `repeat(${blocks.length}, 1fr)` }}
    >
      {blocks.map((block) => (
        <div
          key={block.id}
          className="border border-solid border-gray-300"
        >
          {/* Block header */}
          <div className="bg-[#EAEAEA] text-black text-center py-2.5">
            <Text className="font-semibold text-sm">{block.label}</Text>
          </div>

          {/* Add button with lines */}
          <Flex align="center" className="py-3 px-3">
            <div className="flex-grow h-px bg-gray-300" />
            <ActionIcon
              variant="outline"
              color="gray"
              radius="xl"
              size="md"
              className="mx-2"
              onClick={() => onAddActivity(block.id)}
            >
              <IconPlus size={16} />
            </ActionIcon>
            <div className="flex-grow h-px bg-gray-300" />
          </Flex>

          {/* Activity cards */}
          <div className="flex flex-col gap-3 px-3 pb-3">
            {block.activities.map((activity, idx) => (
              <div
                key={`${block.id}-${activity.id}-${idx}`}
                className="bg-white rounded-lg border border-solid border-gray-300 p-3 relative"
              >
                {/* Colored dot + Name + Badge row */}
                <Flex align="center" gap="xs">
                  {activity.ageGroup && (
                    <IconCircleFilled
                      size={10}
                      className={
                        activity.ageGroup === "OCP"
                          ? "text-red-500"
                          : "text-blue-500"
                      }
                    />
                  )}
                  <Text className="font-bold text-sm flex-grow text-center">
                    {activity.name}
                  </Text>
                  {activity.ageGroup && (
                    <Badge
                      size="xs"
                      color={ageGroupColor[activity.ageGroup]}
                      variant="filled"
                    >
                      {activity.ageGroup}
                    </Badge>
                  )}
                </Flex>

                {/* Line under activity name */}
                <div className="h-px bg-gray-200 my-1.5" />

                {/* Description */}
                <Text className="text-xs text-gray-600 text-center">
                  {activity.description}
                </Text>

                {/* Edit link */}
                <Flex justify="flex-end" className="mt-1">
                  <UnstyledButton
                    onClick={() => {
                      const activityData = activity.ageGroup
                        ? ({
                            id: activity.id,
                            name: activity.name,
                            description: activity.description,
                            programAreaId: activity.programAreaId ?? "",
                            ageGroup: activity.ageGroup,
                          } as BundleActivity)
                        : ({
                            id: activity.id,
                            name: activity.name,
                            description: activity.description,
                          } as JamboreeActivity);
                      onEditActivity(block.id, activityData);
                    }}
                  >
                    <Text className="text-xs text-gray-500">Edit</Text>
                  </UnstyledButton>
                </Flex>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
