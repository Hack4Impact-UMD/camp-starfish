import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  StaffAttendee,
  CamperAttendee,
  AdminAttendee,
} from "@/types/sessions/sessionTypes";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { getAttendeesById } from "../generation/schedulingUtils";
import {
  isBundleActivity,
  isIndividualActivityAssignments,
} from "@/types/scheduling/schedulingTypeGuards";
import { getFullName } from "@/types/users/userUtils";

interface BlockRatiosGridProps {
  schedule: SectionSchedule;
  campers: CamperAttendee[];
  staff: StaffAttendee[];
  admins: AdminAttendee[];
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flexDirection: "column",
    border: "1pt solid black",
    margin: 10,
  },
  row: {
    flexDirection: "row",
    minHeight: 20,
  },

  // Block header styles
  blockHeader: {
    flex: 1,
    border: "1pt solid black",
    backgroundColor: "#f0f0f0",
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },

  // Activity header styles
  activityHeader: {
    flex: 1,
    borderTop: "1pt solid black",
    borderLeft: "1pt solid black",
    borderRight: "1pt solid black",
    borderBottom: "0.25pt solid black", // Lighter border underneath activity header
    padding: 5,
    textAlign: "center",
    fontSize: 6,
  },

  // Campers cell (left column) - lighter right border, strong left border
  campersCell: {
    flex: 1,
    borderTop: "1pt solid black",
    borderLeft: "1pt solid black",
    borderBottom: "1pt solid black",
    borderRight: "0.25pt solid black",
    padding: 3,
    fontSize: 6,
    textAlign: "center",
  },

  // Staff cell (right column) - strong right border, lighter left border
  staffCell: {
    flex: 1,
    borderTop: "1pt solid black",
    borderLeft: "0.25pt solid black",
    borderBottom: "1pt solid black",
    borderRight: "1pt solid black",
    padding: 3,
    fontSize: 6,
    textAlign: "center",
  },
});

export default function BlockRatiosGrid({
  schedule,
  campers,
  staff,
  admins,
}: BlockRatiosGridProps) {
  const blockIds = Object.keys(schedule.blocks).sort();
  const blocks = blockIds.map((blockId) => schedule.blocks[blockId]);

  const attendeesById = getAttendeesById([...campers, ...staff, ...admins]);

  // Find the maximum number of activities across all blocks
  const maxActivities = Math.max(
    ...blocks.map((block) => block.activities.length),
  );

  return (
    <View style={styles.container}>
      {/* Block Headers Row */}
      <View style={styles.row} fixed>
        {blockIds.map((blockId) => (
          <View key={blockId} style={styles.blockHeader}>
            <Text>BLOCK {blockId}</Text>
          </View>
        ))}
      </View>

      {/* Render activities row by row across all blocks */}
      {Array.from({ length: maxActivities }).map((_, activityIndex) => {
        const isGrayRow = activityIndex % 2 === 0; // Start with gray (index 0), then white (index 1), etc.
        const rowBgColor = isGrayRow ? "#d9d9d9" : "#ffffff";

        return (
          <View key={`activity-row-${activityIndex}`} wrap={false}>
            {/* Activity Headers Row */}
            <View style={styles.row}>
              {blockIds.map((blockId) => {
                const block = schedule.blocks[blockId];
                const activity = block.activities[activityIndex];
                if (!activity)
                  return (
                    <View
                      key={`header-${blockId}-${activityIndex}`}
                      style={[
                        styles.activityHeader,
                        { backgroundColor: rowBgColor },
                      ]}
                    />
                  );
                const headerText = activity
                  ? isBundleActivity(activity)
                    ? `${activity.programAreaId}: ${activity.name}`
                    : activity.name
                  : "";
                return (
                  <View
                    key={`header-${blockId}-${activityIndex}`}
                    style={[
                      styles.activityHeader,
                      { backgroundColor: rowBgColor },
                    ]}
                  >
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
                if (!activity)
                  return (
                    <View
                      key={`data-${blockId}-${activityIndex}`}
                      style={{ flex: 1, flexDirection: "row" }}
                    />
                  );

                const camperOrBunkIds = isIndividualActivityAssignments(
                  activity,
                )
                  ? activity.camperIds
                  : activity.bunkNums;
                const employeeIds = isIndividualActivityAssignments(activity)
                  ? [
                      ...activity.staffIds,
                      ...activity.adminIds,
                    ]
                  : activity.adminIds;

                return (
                  <View
                    key={`data-${blockId}-${activityIndex}`}
                    style={{ flex: 1, flexDirection: "row" }}
                  >
                    <View
                      style={[
                        styles.campersCell,
                        { backgroundColor: rowBgColor },
                      ]}
                    >
                      {camperOrBunkIds.map((camperOrBunkId) => (
                        <Text key={camperOrBunkId}>
                          {isIndividualActivityAssignments(activity)
                            ? getFullName(attendeesById[camperOrBunkId].snapshot.name)
                            : `Bunk ${camperOrBunkId}`}
                        </Text>
                      ))}
                    </View>
                    <View
                      style={[
                        styles.staffCell,
                        { backgroundColor: rowBgColor },
                      ]}
                    >
                      {employeeIds.map((employeeId, idx) => (
                        <Text
                          key={idx}
                          style={
                            attendeesById[employeeId].role === "ADMIN"
                              ? { fontWeight: "bold" }
                              : {}
                          }
                        >
                          {getFullName(attendeesById[employeeId].snapshot.name)}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
