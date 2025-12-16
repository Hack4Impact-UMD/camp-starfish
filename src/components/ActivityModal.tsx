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
import { getAttendeesById } from "@/features/scheduling/generation/schedulingUtils";
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
  const {
    session,
    section,
    blockId,
    activity,
    campers,
    staff,
    admins
  } = props;
  const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative bg-camp-background-modal rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        {/* Content */}
        <div className="space-y-6">
          {/* First Row: Section and Date */}
          <div className="bg-camp-background rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-camp-text-modalTitle mb-2">
              {section.name}
            </h2>
            <p className="text-lg text-camp-text-secondary">
              {`${moment(section.startDate).format('dddd M/D')} - ${moment(section.endDate).format('dddd M/D')}`}
            </p>
          </div>

          {/* Second Row: Block and Activity */}
          <div className="bg-camp-background rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-camp-text-modalTitle">
              BLOCK {blockId.toUpperCase()} - {getActivityName(activity)}
            </h3>
              <p className="text-sm text-camp-text-secondary mt-2">
                {activity.description}
              </p>
          </div>

          {/* Third Row: Staff and Campers Grid */}
          <div className="grid grid-cols-2 gap-6 border border-gray-200 rounded-lg overflow-hidden">
            {/* Staff Column */}
            <div className="bg-camp-background p-6 border-r border-gray-200">
              <h4 className="text-lg font-bold text-camp-text-modalTitle mb-4 text-center">
                Staff
              </h4>
              <div className="space-y-3">
                {"staffIds" in activity.assignments &&
                  (activity.assignments as IndividualAssignments).staffIds?.map(
                    (staffId) => (
                      <div
                        key={staffId}
                        className="border border-gray-300 rounded p-3 text-center bg-white"
                      >
                        {getFullName(attendeesById[staffId])}
                      </div>
                    )
                  )}
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
            <div className="bg-camp-background p-6">
              <h4 className="text-lg font-bold text-camp-text-modalTitle mb-4 text-center">
                Camper
              </h4>
              <div className="space-y-3">
                {"camperIds" in activity.assignments &&
                  (
                    activity.assignments as IndividualAssignments
                  ).camperIds?.map((camperId) => (
                    <div
                      key={camperId}
                      className="border border-gray-300 rounded p-3 text-center bg-white"
                    >
                      {getFullName(attendeesById[camperId])}
                    </div>
                  ))}
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
    </div>
  );
}

export function openActivityModal(props: ActivityModalProps) {
  modals.open({
    title: "Activity Modal",
    children: <ActivityModal {...props} />,
  });
}
