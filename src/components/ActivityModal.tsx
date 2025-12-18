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
import { Grid, Stack } from "@mantine/core";

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
        <h2 className="text-2xl font-bold mb-2">{section.name}</h2>
        <p className="text-lg">
          {`${moment(section.startDate).format("dddd M/D")} - ${moment(
            section.endDate
          ).format("dddd M/D")}`}
        </p>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2 w-full">
        <h2 className="text-xl font-bold">
          BLOCK {blockId.toUpperCase()} - {getActivityName(activity)}
        </h2>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2 w-full">
        <p className="text-md text-center">{activity.description}</p>
      </div>
      <p className="text-lg font-bold mb-2 border-black border-b-2 border-r-2 w-full h-full text-center align-middle">
        Staff
      </p>
      <p className="text-lg font-bold mb-2 border-black border-b-2 w-full h-full text-center align-middle">
        Campers
      </p>
      <div className="space-y-3 border-black border-r-2">
        {staffNames.map((staffName) => (
          <div key={staffName} className="p-3 text-center bg-white">
            {staffName}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {camperNames.map((camperName) => (
          <div key={camperName} className="p-3 text-center bg-white">
            {camperName}
          </div>
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
