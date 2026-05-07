"use client";
import React from "react";
import { Text, ActionIcon, Flex } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import ActivityCard from "./ActivityCard";

type BlockWithID = {
    id: string;
    label: string;
    activities: ActivityWithAssignments[];
}

interface BlockGridProps { 
    blocks: BlockWithID[]; 
    onAddActivity: (blockId: string) => void; 
    onEditActivity: (blockId: string, activity: ActivityWithAssignments) => void;
}


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
                            className="mx-2" onClick={() => onAddActivity(block.id)} 
                        > 
                            <IconPlus size={16} /> 
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
                            />
                        ))}
                </div> 
            </div> 
        ))} 
        </div> 
    );
}