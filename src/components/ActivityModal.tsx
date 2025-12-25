"use client";

import React, { useMemo } from "react";
import {
  CamperAttendeeID,
  StaffAttendeeID,
  AdminAttendeeID,
  SectionID,
  ActivityWithAssignments,
} from "@/types/sessionTypes";
import { modals } from "@mantine/modals";
import moment from "moment";
import {
  getAttendeesById,
  isIndividualAssignments,
} from "@/features/scheduling/generation/schedulingUtils";
import { getActivityName } from "@/utils/activityUtils";
import { getFullName } from "@/utils/personUtils";
import { Title, Text } from "@mantine/core";

interface ActivityModalProps {
  section: SectionID;
  blockId: string;
  activity: ActivityWithAssignments;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

export default function ActivityModal(props: ActivityModalProps) {
  const { section, blockId, activity, campers, staff, admins } = props;

  const { staffNames, camperNames } = useMemo(() => {
    const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);
    const assignments = activity.assignments;
    const adminNames = assignments.adminIds.map((adminId) =>
      getFullName(attendeesById[adminId])
    );
    if (isIndividualAssignments(assignments)) {
      return {
        staffNames: [
          ...assignments.staffIds.map((staffId) =>
            getFullName(attendeesById[staffId])
          ),
          ...adminNames,
        ],
        camperNames: assignments.camperIds.map((camperId) =>
          getFullName(attendeesById[camperId])
        ),
      };
    }

    return {
      staffNames: assignments.bunkNums.flatMap((bunkNum) =>
        staff
          .filter((staff) => staff.bunk === bunkNum)
          .map((staff) => getFullName(staff))
      ),
      camperNames: assignments.bunkNums.flatMap((bunkNum) =>
        campers
          .filter((camper) => camper.bunk === bunkNum)
          .map((camper) => getFullName(camper))
      ),
    };
  }, [campers, staff, admins, activity]);

  return (
    <div className="grid grid-cols-2">
      <div className="col-span-2 flex flex-col justify-center items-center bg-[#D6EAF8] rounded-none border-black border-y-2 py-2 w-full">
        <Title order={2} className="mb-2">{section.name}</Title>
        <Text className="text-lg">
          {`${moment(section.startDate).format("dddd M/D")} - ${moment(
            section.endDate
          ).format("dddd M/D")}`}
        </Text>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2 w-full">
        <Title order={3} className="font-bold">
          BLOCK {blockId.toUpperCase()} - {getActivityName(activity)}
        </Title>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2 w-full">
        <Text className="text-md text-center">{activity.description}</Text>
      </div>
      <Text className="text-lg font-bold mb-2 border-black border-b-2 border-r-2 w-full h-full text-center align-middle">
        Staff
      </Text>
      <Text className="text-lg font-bold mb-2 border-black border-b-2 w-full h-full text-center align-middle">
        Campers
      </Text>
      <div className="space-y-3 border-black border-r-2">
        {staffNames.map((staffName) => (
          <Text key={staffName} className="p-3 text-center bg-white">
            {staffName}
          </Text>
        ))}
      </div>
      <div className="space-y-3">
        {camperNames.map((camperName) => (
          <Text key={camperName} className="p-3 text-center bg-white">
            {camperName}
          </Text>
        ))}
      </div>
    </div>
  );
}

export function openActivityModal(props: ActivityModalProps) {
  modals.open({
    title: "Activity Modal",
    children: <ActivityModal {...props} />,
    classNames: {
      content: "rounded-none border-2 border-black",
      body: "p-0",
    },
  });
}
