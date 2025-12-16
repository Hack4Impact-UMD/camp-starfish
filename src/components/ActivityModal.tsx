"use client";

import React, { useMemo } from "react";
import {
  IndividualAssignments,
  BunkAssignments,
  Activity,
  CamperAttendeeID,
  StaffAttendeeID,
  AdminAttendeeID,
  SessionID,
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

interface ActivityModalProps {
  session: SessionID;
  section: SectionID;
  blockId: string;
  activity: ActivityWithAssignments;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

export default function ActivityModal(props: ActivityModalProps) {
  const { session, section, blockId, activity, campers, staff, admins } = props;
  const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);

  return (
    <div className="grid grid-cols-2 justify-center items-center w-full m-0 p-0">
      {/* Content */}
      <div className="col-span-2 flex flex-col gap-0 w-full">
        {/* First Row: Section and Date */}
        <div className="flex flex-col justify-center items-center bg-[#D6EAF8] rounded-none border-black border-y-2 py-2">
          <h2 className="text-2xl font-bold mb-2">{section.name}</h2>
          <p className="text-lg text-camp-text-secondary">
            {`${moment(section.startDate).format("dddd M/D")} - ${moment(
              section.endDate
            ).format("dddd M/D")}`}
          </p>
        </div>

        {/* Second Row: Block and Activity */}
        <div className="flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2">
          <h2 className="text-xl font-bold">
            BLOCK {blockId.toUpperCase()} - {getActivityName(activity)}
          </h2>
        </div>
        <div className="flex flex-col justify-center items-center bg-white rounded-none border-black border-b-2 py-2">
          <p className="text-md text-center">{activity.description}</p>
        </div>

        {/* Third Row: Staff and Campers Grid */}
        <div className="flex flex-row">
          {/* Staff Column */}
          <div className="flex flex-col justify-center items-center bg-white border-black border-r-2 w-1/2">
            <h4 className="text-lg font-bold mb-2 border-black border-b-2 w-full h-full text-center align-middle">
              Staff
            </h4>
            <div className="space-y-3">
              {isIndividualAssignments(activity.assignments)
                ? activity.assignments.staffIds.map((staffId) => (
                    <div
                      key={staffId}
                      className="border border-gray-300 rounded p-3 text-center bg-white"
                    >
                      {getFullName(attendeesById[staffId])}
                    </div>
                  ))
                : activity.assignments.bunkNums.map((bunkNum) => (
                    <div
                      key={bunkNum}
                      className="border border-gray-300 rounded p-3 text-center bg-white"
                    >
                      {`Bunk ${bunkNum}`}
                    </div>
                  ))}

              {activity.assignments.adminIds &&
                activity.assignments.adminIds.map((adminId) => (
                  <div
                    key={adminId}
                    className="border border-gray-300 rounded p-3 text-center bg-white"
                  >
                    {getFullName(attendeesById[adminId])}
                  </div>
                ))}
            </div>
          </div>

          {/* Campers Column */}
          <div className="flex flex-col justify-center items-center bg-white border-black w-1/2">
            <h4 className="text-lg font-bold mb-2 border-black border-b-2 w-full h-full text-center align-middle">
              Campers
            </h4>
            <div className="space-y-3">
              {"camperIds" in activity.assignments &&
                (activity.assignments as IndividualAssignments).camperIds?.map(
                  (camperId) => (
                    <div
                      key={camperId}
                      className="border border-gray-300 rounded p-3 text-center bg-white"
                    >
                      {getFullName(attendeesById[camperId])}
                    </div>
                  )
                )}
              {"bunkNums" in activity.assignments &&
                (activity.assignments as BunkAssignments).bunkNums?.map(
                  (bunkNum) => (
                    <div
                      key={bunkNum}
                      className="border border-gray-300 rounded p-3 text-center bg-white"
                    >
                      Bunk {bunkNum}
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
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
