import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SchedulingSectionType } from "@/types/sessionTypes";

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
  // Get block IDs
  const blockIds = Object.keys(schedule.blocks).sort() 
  // Build block data: convert schedule to { blockId, activities: { name, campers: string[], staffAdmins: {name: string, isAdmin: boolean}[] }[] }[]
  const blocks = blockIds.map(blockId => {
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
  
  // For each activity row, calculate the max names needed across all blocks
  const calculateMaxNamesForActivityRow = (activityIndex: number): number => {
    let maxNames = 0;
    blocks.forEach(block => {
      if (activityIndex < block.activities.length) {
        const activity = block.activities[activityIndex];
        const namesCount = Math.max(activity.campers.length, activity.staff.length);
        maxNames = Math.max(maxNames, namesCount);
      }
    });
    return maxNames;
  };

  return (
    <View style={styles.container}>
      {/* Block Headers Row */}
      <View style={styles.row}>
        {blocks.map((block) => (
          <View key={block.name} style={styles.blockHeader}>
            <Text>BLOCK {block.name}</Text>
          </View>
        ))}
      </View>

      {/* Render activities row by row across all blocks */}
      {Array.from({ length: maxActivities }).map((_, activityIndex) => {
        const maxNamesInThisRow = calculateMaxNamesForActivityRow(activityIndex);
        const isGrayRow = activityIndex % 2 === 0; // Start with gray (index 0), then white (index 1), etc.
        const rowBgColor = isGrayRow ? '#d9d9d9' : '#ffffff';
        
        return (
          <React.Fragment key={`activity-row-${activityIndex}`}>
            {/* Activity Headers Row */}
            <View style={styles.row}>
              {blocks.map((block) => {
                const activity = block.activities[activityIndex];
                // Display activity name and program area if it's a bundle
                const headerText = activity 
                  ? activity.programArea 
                    ? `${activity.name} - ${activity.programArea}`
                    : activity.name
                  : '';
                return (
                  <View key={`header-${block.name}-${activityIndex}`} 
                        style={[styles.activityHeader, { backgroundColor: rowBgColor }]}>
                    <Text>{headerText}</Text>
                  </View>
                );
              })}
            </View>
            
            {/* Data Columns Row - all aligned to same height */}
            <View style={styles.row}>
              {blocks.map((block) => {
                const activity = block.activities[activityIndex];
                
                // Pad arrays to match maxNamesInThisRow
                const paddedCampers = [...activity.campers];
                const paddedStaff = [...activity.staff];
                while (paddedCampers.length < maxNamesInThisRow) paddedCampers.push('');
                while (paddedStaff.length < maxNamesInThisRow) paddedStaff.push({ name: '', isAdmin: false });
                
                return (
                  <View key={`data-${block.name}-${activityIndex}`} style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={[styles.campersCell, { backgroundColor: rowBgColor }]}>
                      <Text>{paddedCampers.join('\n')}</Text>
                    </View>
                    <View style={[styles.staffCell, { backgroundColor: rowBgColor }]}>
                      {paddedStaff.map((staffMember, idx) => (
                        <Text key={idx} style={staffMember.isAdmin ? { fontWeight: 'bold' } : {}}>
                          {staffMember.name}
                          {idx < paddedStaff.length - 1 && '\n'}
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