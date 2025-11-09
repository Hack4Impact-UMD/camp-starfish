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
  trigger: React.ReactNode;
  sessionId: string;
  sectionId: string;
  blockId: string;
  activityIndex: number;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  trigger,
  sessionId,
  sectionId,
  blockId,
  activityIndex,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-camp-background-modal rounded-lg shadow-lg w-full max-w-2xl mx-4 p-8">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 flex-shrink-0 hover:opacity-70 transition"
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
                {/* Section Type Badge */}
                <div className="inline-block bg-camp-primary text-white px-4 py-2 rounded-full font-lato font-semibold text-sm">
                  {data.section.type.replace(/-/g, ' ')}
                </div>

                {/* Date Range */}
                <div className="text-camp-text-modalSecondaryTitle font-lato text-lg">
                  {formatDateRange(data.section.startDate, data.section.endDate)}
                </div>

                {/* Activity Name & Details */}
                <div className="border-b border-gray-300 pb-4">
                  <h2 className="text-3xl font-lato font-bold text-camp-text-modalTitle mb-2">
                    {activity.name}
                  </h2>
                  
                  {/* Bundle-specific info */}
                  {'programArea' in activity && (activity as unknown as BundleActivity).programArea && (
                    <div className="text-camp-text-modalSecondaryTitle font-lato text-base">
                      <span className="font-semibold">Program Area:</span>{' '}
                      {(activity as unknown as BundleActivity).programArea.name}
                    </div>
                  )}
                  
                  {/* Description */}
                  {activity.description && (
                    <p className="text-camp-text-modalSecondaryTitle font-lato text-base mt-2">
                      {activity.description}
                    </p>
                  )}
                  
                  {/* Age Group for Bundle activities */}
                  {'ageGroup' in activity && (activity as unknown as BundleActivity).ageGroup && (
                    <div className="text-camp-text-modalSecondaryTitle font-lato text-base mt-1">
                      <span className="font-semibold">Age Group:</span>{' '}
                      {(activity as unknown as BundleActivity).ageGroup}
                    </div>
                  )}
                </div>

                {/* Assignments Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campers Column */}
                  {'camperIds' in activity.assignments && (
                    <div>
                      <h3 className="text-xl font-lato font-bold text-camp-text-modalTitle mb-3">
                        Campers
                      </h3>
                      <div className="space-y-2">
                        {(activity.assignments as IndividualAssignments).camperIds?.length > 0 ? (
                          (activity.assignments as IndividualAssignments).camperIds.map((camperId) => (
                            <div
                              key={camperId}
                              className="bg-white border border-gray-300 rounded-md px-4 py-2 font-lato text-base"
                            >
                              {getAttendeeName(camperId, 'CAMPER')}
                            </div>
                          ))
                        ) : (
                          <p className="text-camp-text-modalSecondaryTitle font-lato italic">
                            No campers assigned
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Bunk Assignments (for Bunk Jamboree) */}
                  {'bunkNums' in activity.assignments && (
                    <div>
                      <h3 className="text-xl font-lato font-bold text-camp-text-modalTitle mb-3">
                        Bunks
                      </h3>
                      <div className="space-y-2">
                        {(activity.assignments as BunkAssignments).bunkNums?.length > 0 ? (
                          (activity.assignments as BunkAssignments).bunkNums.map((bunkNum) => (
                            <div
                              key={bunkNum}
                              className="bg-white border border-gray-300 rounded-md px-4 py-2 font-lato text-base"
                            >
                              Bunk {bunkNum}
                            </div>
                          ))
                        ) : (
                          <p className="text-camp-text-modalSecondaryTitle font-lato italic">
                            No bunks assigned
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Staff & Admins Column */}
                  <div>
                    <h3 className="text-xl font-lato font-bold text-camp-text-modalTitle mb-3">
                      Staff & Admins
                    </h3>
                    <div className="space-y-2">
                      {/* Staff */}
                      {'staffIds' in activity.assignments && 
                        (activity.assignments as IndividualAssignments).staffIds?.map((staffId) => (
                          <div
                            key={staffId}
                            className="bg-white border border-gray-300 rounded-md px-4 py-2 font-lato text-base"
                          >
                            {getAttendeeName(staffId, 'STAFF')}
                          </div>
                        ))}
                      
                      {/* Admins */}
                      {activity.assignments.adminIds?.map((adminId) => (
                        <div
                          key={adminId}
                          className="bg-white border border-gray-300 rounded-md px-4 py-2 font-lato text-base font-bold"
                        >
                          {getAttendeeName(adminId, 'ADMIN')} (Admin)
                        </div>
                      ))}
                      
                      {/* Empty state */}
                      {(!('staffIds' in activity.assignments) || 
                         (activity.assignments as IndividualAssignments).staffIds?.length === 0) &&
                       (!activity.assignments.adminIds || 
                        activity.assignments.adminIds.length === 0) && (
                        <p className="text-camp-text-modalSecondaryTitle font-lato italic">
                          No staff or admins assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-camp-buttons-neutral text-black px-8 py-3 rounded-full font-lato font-semibold text-lg hover:bg-gray-400 transition"
                  >
                    CLOSE
                  </button>
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
