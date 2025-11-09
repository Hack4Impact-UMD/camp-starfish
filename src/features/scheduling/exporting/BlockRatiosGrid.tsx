import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SchedulingSectionType } from "@/types/sessionTypes";
import { getAttendeesById, isBundleActivity, isIndividualAssignments } from '../generation/schedulingUtils';
import { getFullName } from '@/utils/personUtils';

// Helper function to map attendee IDs to names
function idToName(
  id: number | undefined, 
  attendees?: CamperAttendeeID[] | StaffAttendeeID[] | AdminAttendeeID[],
  includeBunk: boolean = false
) {
  if (id == null || !attendees) return undefined;
  const found = attendees.find(a => a.id === id);
  if (!found) return String(id);
  const nameStr = `${found.name.firstName} ${found.name.lastName ? found.name.lastName.charAt(0) + '.' : ''}`;

  // Include bunk number for campers if requested
  if (includeBunk && 'bunk' in found && found.bunk != null) {
    return `${nameStr} (${found.bunk})`;
  }
  return nameStr;
}

interface ScheduleGridProps<T extends SchedulingSectionType = SchedulingSectionType> {
  schedule: SectionSchedule<T>;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

const styles = StyleSheet.create({
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
});

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  schedule, 
  campers, 
  staff, 
  admins
}) => {
  const blockIds = Object.keys(schedule.blocks).sort() 
  const blocks = blockIds.map(blockId => schedule.blocks[blockId]);

  const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);


  const x = blockIds.map(blockId => {
    const block = schedule.blocks[blockId];
    if (!block) {
      return { name: blockId, activities: [] };
    }

    const activities = block.activities || [];
    const actRows = activities.map((act) => {
      const assign = act.assignments;
      const campersList: string[] = [];
      const staffAdminsList: { name: string; isAdmin: boolean }[] = [];

      // Add campers with bunk numbers in parentheses (IndividualAssignments)
      if ('camperIds' in assign) {
        assign.camperIds?.forEach((cid: number) => {
          const name = idToName(cid, campers, true);
          if (name) campersList.push(name);
        });
      }
      
      // For Bundle activities, find program counselor based on programArea match
      const programCounselorId = ('programArea' in act && act.programArea && 'staffIds' in assign)
        ? staff.find(s => 
            assign.staffIds?.includes(s.id) && 
            s.programCounselor?.name === act.programArea.name
          )?.id
        : undefined;

      // Add program counselor first if found
      if (programCounselorId) {
        const name = idToName(programCounselorId, staff);
        if (name) staffAdminsList.push({ name, isAdmin: false });
      }
      
      // Add other staff members (excluding program counselor)
      if ('staffIds' in assign) {
        assign.staffIds?.forEach((sid: number) => {
          if (sid === programCounselorId) return;
          const name = idToName(sid, staff);
          if (name) staffAdminsList.push({ name, isAdmin: false });
        });
      }
      
      // Add admins at the end
      if ('adminIds' in assign) {
        assign.adminIds?.forEach((aid: number) => {
          const name = idToName(aid, admins);
          if (name) staffAdminsList.push({ name, isAdmin: true });
        });
      }

      // Handle bunk assignments
      if ('bunk' in assign && assign.bunk != null) {
        campersList.push(`Bunk ${assign.bunk}`);
      }

      return { 
        name: act.name || "", 
        programArea: 'programArea' in act ? act.programArea?.name : undefined,
        campers: campersList, 
        staff: staffAdminsList
      };
    });

    return { name: blockId, activities: actRows };
  });
  
  // Find the maximum number of activities across all blocks
  const maxActivities = Math.max(...blocks.map(block => block.activities.length));

  return (
    <View style={styles.container}>
      {/* Block Headers Row */}
      <View style={styles.row}>
        {blockIds.map((blockId) => (
          <View key={blockId} style={styles.blockHeader}>
            <Text>BLOCK {blockId}</Text>
          </View>
        ))}
      </View>

      {/* Render activities row by row across all blocks */}
      {Array.from({ length: maxActivities }).map((_, activityIndex) => {
        const isGrayRow = activityIndex % 2 === 0; // Start with gray (index 0), then white (index 1), etc.
        const rowBgColor = isGrayRow ? '#d9d9d9' : '#ffffff';
        
        return (
          <React.Fragment key={`activity-row-${activityIndex}`}>
            {/* Activity Headers Row */}
            <View style={styles.row}>
              {blockIds.map((blockId) => {
                const block = schedule.blocks[blockId];
                const activity = block.activities[activityIndex];
                // Display activity name and program area if it's a bundle
                const headerText = activity 
                  ? isBundleActivity(activity) 
                    ? `${activity.programArea.id}: ${activity.name}`
                    : activity.name
                  : '';
                return (
                  <View key={`header-${blockId}-${activityIndex}`} 
                        style={[styles.activityHeader, { backgroundColor: rowBgColor }]}>
                    <Text>{headerText}</Text>
                  </View>
                );
              })}
            </View>
            
            {/* Data Columns Row - all aligned to same height */}
            <View style={styles.row}>
              {blockIds.map((blockId) => {
                const block = schedule.blocks[blockId];
                const activity = block.activities[activityIndex];
                
                const camperOrBunkIds = [...(isIndividualAssignments(activity.assignments) ? activity.assignments.camperIds : activity.assignments.bunkNums)];
                const employeeIds = [...(isIndividualAssignments(activity.assignments) ? [...activity.assignments.staffIds, ...activity.assignments.adminIds] : activity.assignments.adminIds)];
                
                return (
                  <View key={`data-${blockId}-${activityIndex}`} style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={[styles.campersCell, { backgroundColor: rowBgColor }]}>
                      {camperOrBunkIds.map(camperOrBunkId => <Text>{isIndividualAssignments(activity.assignments) ? getFullName(attendeesById[camperOrBunkId]) : `Bunk ${camperOrBunkId}`}</Text>)}
                    </View>
                    <View style={[styles.staffCell, { backgroundColor: rowBgColor }]}>
                      {employeeIds.map((staffId, idx) => (
                        <Text key={idx} style={attendeesById[staffId].role === "ADMIN" ? { fontWeight: 'bold' } : {}}>
                          {getFullName(attendeesById[staffId])}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default ScheduleGrid;