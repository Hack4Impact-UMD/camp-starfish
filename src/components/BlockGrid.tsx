"use client";
import React from "react";
import { Text, ActionIcon, Flex } from "@mantine/core";
import { MdAdd } from "react-icons/md";
import { ActivityWithAssignments, BlockWithId } from "@/types/scheduling/schedulingTypes";
import ActivityCard from "@/components/ActivityCard";

interface BlockGridProps {
    blocks: BlockWithId[];
    onAddActivity: (blockId: string) => void;
    onEditActivity: (blockId: string, activity: ActivityWithAssignments) => void;
    categoryColors?: Record<string, string>;
}


export default function BlockGrid({ blocks, onAddActivity, onEditActivity, categoryColors }: BlockGridProps) {
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
                    <div className="bg-neutral-2 text-black text-center py-2.5">
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
                                aria-label={`Add activity to ${block.label}`}
                            > 
                                <MdAdd size={16} />
                            </ActionIcon>
                        <div className="flex-grow h-px bg-gray-300" /> 
                    </Flex>
                    {/* Activity cards */} 
                    <div className="flex flex-col gap-3 px-3 pb-3"> 
                        {block.activities.map((activity, idx) => (
                            <ActivityCard
                                key={`${block.id}-${activity.id}-${idx}`}
                                activity={activity}
                                blockId={block.id}
                                onEditActivity={onEditActivity}
                                categoryColors={categoryColors}
                            />
                        ))}
                </div> 
            </div> 
        ))} 
        </div> 
    );
}