"use client";

import React, { useState } from "react";
import Image from "next/image";
import cross from "@/assets/icons/crossIcon.svg";
import { useActivityData } from "@/hooks/useActivityData";
import { 
  BundleActivity, 
  JamboreeActivity,
  IndividualAssignments,
  BunkAssignments,
} from "@/types/sessionTypes";

interface ActivityModalProps {
  trigger?: React.ReactNode;
  sessionId: string;
  sectionId: string;
  blockId: string;
  activityIndex: number;
  defaultOpen?: boolean;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  trigger,
  sessionId,
  sectionId,
  blockId,
  activityIndex,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const { data, isLoading, error } = useActivityData({
    sessionId,
    sectionId,
    blockId,
    activityIndex,
  });

  // Helper to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString("en-US", {
      weekday: "long",
      month: "numeric",
      day: "numeric",
    });
    
    const endFormatted = end.toLocaleDateString("en-US", {
      weekday: "long",
      month: "numeric",
      day: "numeric",
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Helper to get attendee name by ID
  const getAttendeeName = (id: number, role: 'CAMPER' | 'STAFF' | 'ADMIN') => {
    if (!data) return `ID: ${id}`;
    
    const attendeeList = 
      role === 'CAMPER' ? data.campers :
      role === 'STAFF' ? data.staff :
      data.admins;
    
    const attendee = attendeeList.find(a => a.id === id);
    if (!attendee) return `ID: ${id}`;
    
    return `${attendee.name.firstName} ${attendee.name.lastName || ''}`.trim();
  };

  // Get activity from schedule
  const getActivityFromSchedule = () => {
    if (!data) return null;
    
    const block = data.schedule.blocks[blockId];
    if (!block) return null;
    
    const activity = block.activities[activityIndex];
    return activity || null;
  };

  const activity = getActivityFromSchedule();

  return (
    <>
      {trigger && (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-camp-background-modal rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="sticky top-0 float-right flex-shrink-0 hover:opacity-70 transition z-10 bg-camp-background-modal"
            >
              <Image
                src={cross.src}
                alt="close"
                className="w-7 h-7"
                width={29}
                height={29}
              />
            </button>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-xl text-camp-text-modalTitle font-lato">
                  Loading activity details...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-xl text-camp-text-error font-lato">
                  Error loading activity: {error.message}
                </p>
              </div>
            )}

            {/* Content */}
            {data && activity && !isLoading && !error && (
              <div className="space-y-6">
                {/* First Row: Section and Date */}
                <div className="bg-camp-background rounded-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-camp-text-modalTitle mb-2">
                    {data.section.name}
                  </h2>
                  <p className="text-lg text-camp-text-secondary">
                    {formatDateRange(data.section.startDate, data.section.endDate)}
                  </p>
                </div>

                {/* Second Row: Block and Activity */}
                <div className="bg-camp-background rounded-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-camp-text-modalTitle">
                    BLOCK {blockId.toUpperCase()} - "{activity.name.toUpperCase()}"
                  </h3>
                  {activity.description && (
                    <p className="text-sm text-camp-text-secondary mt-2">
                      {activity.description}
                    </p>
                  )}
                </div>

                {/* Third Row: Staff and Campers Grid */}
                <div className="grid grid-cols-2 gap-6 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Staff Column */}
                  <div className="bg-camp-background p-6 border-r border-gray-200">
                    <h4 className="text-lg font-bold text-camp-text-modalTitle mb-4 text-center">
                      Staff
                    </h4>
                    <div className="space-y-3">
                      {('staffIds' in activity.assignments) && (activity.assignments as IndividualAssignments).staffIds?.map((staffId) => (
                        <div key={staffId} className="border border-gray-300 rounded p-3 text-center bg-white">
                          {getAttendeeName(staffId, 'STAFF')}
                        </div>
                      ))}
                      {activity.assignments.adminIds && activity.assignments.adminIds.map((adminId) => (
                        <div key={adminId} className="border border-gray-300 rounded p-3 text-center bg-white">
                          {getAttendeeName(adminId, 'ADMIN')}
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
                      {('camperIds' in activity.assignments) && (activity.assignments as IndividualAssignments).camperIds?.map((camperId) => (
                        <div key={camperId} className="border border-gray-300 rounded p-3 text-center bg-white">
                          {getAttendeeName(camperId, 'CAMPER')}
                        </div>
                      ))}
                      {('bunkNums' in activity.assignments) && (activity.assignments as BunkAssignments).bunkNums?.map((bunkNum) => (
                        <div key={bunkNum} className="border border-gray-300 rounded p-3 text-center bg-white">
                          Bunk {bunkNum}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityModal;
