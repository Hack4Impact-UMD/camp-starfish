import { Block, SchedulingSectionType } from "@/types/sessionTypes";
import React from "react";

interface ActivityGridCellProps {
  block: Block<SchedulingSectionType>;
}


export const ActivityGridCell: React.FC<ActivityGridCellProps> = ({
  block,
}) => {
    console.log(block)
  return (
    <>
        Row
    </>
  )
};
