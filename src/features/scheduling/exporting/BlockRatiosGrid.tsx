import React from 'react';
import { View, Text,} from '@react-pdf/renderer';
import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SchedulingSectionType } from "@/types/sessionTypes";
import { getAttendeesById, isBundleActivity, isIndividualAssignments } from '../generation/schedulingUtils';
import { tw } from "@/utils/reactPdfTailwind";
import {Table, TR, TH, TD} from '@ag-media/react-pdf-table';

// helper function to format first name and first initial of last name"
const formatNameShort = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName[0]}.`;
};

interface BlockRatiosGridProps<T extends SchedulingSectionType = SchedulingSectionType> {
  schedule: SectionSchedule<T>;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

/*const styles = StyleSheet.create({
  // Container styles
  container: {
    flexDirection: 'column',
    border: '1pt solid black',
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    minHeight: 20,
  },
  
  // Block header styles
  blockHeader: {
    flex: 1,
    border: '1pt solid black',
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 8,
  },
  
  // Activity header styles
  activityHeader: {
    flex: 1,
    borderTop: '1pt solid black',
    borderLeft: '1pt solid black',
    borderRight: '1pt solid black',
    borderBottom: '0.25pt solid black', // Lighter border underneath activity header
    padding: 5,
    textAlign: 'center',
    fontSize: 6,
  },

  // Campers cell (left column) - lighter right border, strong left border
  campersCell: {
    flex: 1,
    borderTop: '1pt solid black',
    borderLeft: '1pt solid black',
    borderBottom: '1pt solid black',
    borderRight: '0.25pt solid black',
    padding: 3,
    fontSize: 6,
    textAlign: 'center',
  },
  
  // Staff cell (right column) - strong right border, lighter left border
  staffCell: {
    flex: 1,
    borderTop: '1pt solid black',
    borderLeft: '0.25pt solid black',
    borderBottom: '1pt solid black',
    borderRight: '1pt solid black',
    padding: 3,
    fontSize: 6,
    textAlign: 'center',
  },
}); */

export default function BlockRatiosGrid<T extends SchedulingSectionType>({ schedule, campers, staff, admins }: BlockRatiosGridProps<T>) {
  const blockIds = Object.keys(schedule.blocks).sort() 
  const blocks = blockIds.map(blockId => schedule.blocks[blockId]);

  const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);

  // Find the maximum number of activities across all blocks
  const maxActivities = Math.max(...blocks.map(block => block.activities.length));

  return (
    <Table style={[tw("text-center items-center justify-center flex-col border border-black m-[10px]"),{ width: "75%" }]}>
      {/* Block Headers Row */}
      <TH style={tw(" text-center items-center justify-center flex-row min-h-[20px]")}>
        {blockIds.map((blockId) => (
          <React.Fragment key={blockId}>
            <TR style={tw("flex-1 border border-black bg-gray-light p-[5px] text-center items-center justify-center font-bold text-[8px]")}>
              <Text>BLOCK {blockId}</Text>
            </TR>
          </React.Fragment>
        ))}
      </TH>

      {/* Render activities row by row across all blocks */}
      {Array.from({ length: maxActivities }).map((_, activityIndex) => {
        const isGrayRow = activityIndex % 2 === 0; // Start with gray (index 0), then white (index 1), etc.
        const rowBgColor = isGrayRow ? '#d9d9d9' : '#ffffff';
        
        return (
          <React.Fragment key={`activity-row-${activityIndex}`}>
            {/* Activity Headers Row */}
            <TR style={tw("flex-row min-h-[20px] border border-black")}>
              {blockIds.map((blockId) => {
                const block = schedule.blocks[blockId];
                const activity = block.activities[activityIndex];
                if (!activity) return <TD key={`header-${blockId}-${activityIndex}`} style={[tw("flex-1 border border-black text-center items-center justify-centerp-[5px] text-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]} />
                const headerText = activity 
                  ? isBundleActivity(activity) 
                    ? `${activity.programArea.id}`
                    : activity.name
                  : ' ';
                return (
                  <TD key={`header-${blockId}-${activityIndex}`} 
                        style={[tw("flex-1 text-center items-center justify-centerborder border-black p-[5px] text-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]}>
                    <Text>{headerText}</Text>
                  </TD>
                );
              })}
            </TR>
            
            {/* Data Columns Row - all aligned to same height */}
            <TR style={tw("flex-row min-h-[20px]")}>
              {blockIds.map((blockId) => {
                const block = schedule.blocks[blockId];
                const activity = block.activities[activityIndex];
                if (!activity) {
                  return (
                    <React.Fragment key={`data-${blockId}-${activityIndex}`}>
                      <TD style={[tw("flex-1 border border-black p-[3px] text-center items-center justify-center text-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]} />
                      <TD style={[tw("flex-1 border border-black p-[3px] text-center items-center justify-centertext-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]} />
                    </React.Fragment>
                  );
                }
                
                const camperOrBunkIds = isIndividualAssignments(activity.assignments) ? activity.assignments.camperIds : activity.assignments.bunkNums;
                const employeeIds = isIndividualAssignments(activity.assignments) ? [...activity.assignments.staffIds, ...activity.assignments.adminIds] : activity.assignments.adminIds;
                
                return (
                  <React.Fragment key={`data-${blockId}-${activityIndex}`}>
                    {/* Campers/Bunks Column */}
                    <TD style={[tw("flex-1 border border-black text-center items-center justify-center p-[3px] text-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]}>
                      <View style={[tw("flex-col"), { alignItems: 'center' }]}>
                        {camperOrBunkIds.map(camperOrBunkId => {
                          if (isIndividualAssignments(activity.assignments)) {
                            const attendee = attendeesById[camperOrBunkId];
                            //if attendee is a camper (has bunk property)
                            const bunkNumber = attendee && attendee.role === "CAMPER" && 'bunk' in attendee ? attendee.bunk : undefined;
                            return (
                              <Text key={camperOrBunkId} style={[tw("mb-[1px]"), { textAlign: 'center' }]}>
                                {formatNameShort(attendee.name.firstName, attendee.name.lastName)}
                                {bunkNumber !== undefined ? ` (${bunkNumber})` : ''}
                              </Text>
                            );
                          } else {
                            return (
                              <Text key={camperOrBunkId} style={[tw("mb-[1px]"), { textAlign: 'center' }]}>
                                Bunk {camperOrBunkId}
                              </Text>
                            );
                          }
                        })}
                      </View>
                    </TD>
                    {/* Staff/Admin Column */}
                    <TD style={[tw("flex-1 border border-black text-center items-center justify-center p-[3px] text-[6px]"), { backgroundColor: rowBgColor, textAlign: 'center' }]}>
                      <View style={[tw("flex-col"), { alignItems: 'center' }]}>
                        {employeeIds.map((employeeId, idx) => {
                          const employee = attendeesById[employeeId];
                          return (
                            <Text 
                              key={idx}
                              style={[
                                tw("mb-[1px]"),
                                { textAlign: 'center' },
                                employee.role === "ADMIN" ? { fontWeight: 'bold' } : {}
                              ]}
                            >
                              {formatNameShort(employee.name.firstName, employee.name.lastName)}
                            </Text>
                          );
                        })}
                      </View>
                    </TD>
                  </React.Fragment>
                );
              })}
            </TR>
          </React.Fragment>
        );
      })}
    </Table>
  );
};