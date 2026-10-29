import {
  AdminAttendee,
  CamperAttendee,
  Freeplay,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { getFreeplayAssignmentId } from "../generation/schedulingUtils";
import {
  isBundleActivity,
  isBunkJamboreeBlock,
} from "@/types/scheduling/schedulingTypeGuards";
import { getFullName } from "@/types/users/userUtils";
import { isStaffAttendee } from "@/types/sessions/sessionTypeGuards";

const styles = StyleSheet.create({
  page: {
    padding: 15, // Reduced padding
    fontSize: 8, // Reduced font size
    fontFamily: "Helvetica",
  },
  sectionTitle: {
    fontSize: 12, // Reduced title size
    marginVertical: 6,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    padding: 1, // Reduced padding
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    marginBottom: 8, // Reduced margin
    borderWidth: 1,
    borderColor: "#000",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#000",
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 8, // Reduced font size
    fontWeight: "bold",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    padding: 1, // Reduced padding
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  bunkCell: {
    flex: 1,
    padding: 1, // Reduced padding
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#d3d3d3",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 7, // Smaller font for bunk numbers
  },
  dataCell: {
    flex: 1,
    padding: 1, // Reduced padding
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 7, // Smaller font for data
  },
  // New styles for two-column layout
  twoColumnPage: {
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
    flexDirection: "row",
  },
  leftColumn: {
    width: "50%",
    paddingRight: 5,
  },
  rightColumn: {
    width: "50%",
    paddingLeft: 5,
    marginLeft: "auto", // This will push the right column to the right side
  },
  // Styles for smaller tables in two-column layout
  compactTable: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  compactHeaderCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 7, // Even smaller for compact layout
    fontWeight: "bold",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    padding: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  compactDataCell: {
    flex: 1,
    padding: 1,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 6, // Very small font for compact layout
  },
  compactBunkCell: {
    flex: 1,
    padding: 1,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#d3d3d3",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 6, // Very small font for compact layout
  },
});

interface CounselorGridProps {
  schedule: SectionSchedule;
  freeplay: Freeplay;
  campers: CamperAttendee[];
  counselors: AdminAttendee[] | StaffAttendee[];
}

export default function CounselorGrid(props: CounselorGridProps) {
  const { schedule, freeplay, campers, counselors } = props;
  return (
    <View style={styles.page}>
      <Text style={styles.sectionTitle}>
        {counselors.length === 0
          ? "Counselor"
          : counselors[0].role === "ADMIN"
            ? "Admin"
            : "Staff"}{" "}
        Assignments
      </Text>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>NAME</Text>
          {Object.keys(schedule.blocks).map((blockId) => (
            <Text key={blockId} style={styles.headerCell}>
              {blockId}
            </Text>
          ))}
          <Text style={styles.headerCell}>APO</Text>
          <Text style={styles.headerCell}>AM/PM FP</Text>
        </View>

        {counselors.map((counselor) => {
          const fpBuddyIds = getFreeplayAssignmentId(
            freeplay,
            counselor.attendeeId,
          );
          const fpBuddies = fpBuddyIds
            ? (fpBuddyIds as number[]).map((id) =>
                campers.find((c) => c.attendeeId === id),
              )
            : [];

          let apoText: string = "-";
          for (const period of Object.keys(schedule.alternatePeriodsOff)) {
            if (
              schedule.alternatePeriodsOff[period].includes(counselor.attendeeId)
            ) {
              apoText = period;
              break;
            }
          }

          return (
            <View key={counselor.attendeeId} style={styles.row}>
              {/* Name column - Use dataCell style */}
              <View style={styles.dataCell}>
                <Text>
                  {counselor.snapshot.name.firstName}{" "}
                  {counselor.snapshot.name.lastName[0]}.
                </Text>
              </View>
              {Object.keys(schedule.blocks).map((blockId) => {
                const block = schedule.blocks[blockId];
                let activityText;
                if (block.periodsOff.includes(counselor.attendeeId)) {
                  activityText = "OFF";
                } else {
                  const activity = isStaffAttendee(counselor)
                    ? isBunkJamboreeBlock(block)
                      ? Object.values(block.activities).find((act) =>
                          act.bunkNums.includes(counselor.bunk),
                        )
                      : Object.values(block.activities).find((act) =>
                          act.staffIds.includes(counselor.attendeeId),
                        )
                    : Object.values(block.activities).find((act) =>
                        act.adminIds.includes(counselor.attendeeId),
                      );
                  activityText = activity
                    ? isBundleActivity(activity)
                      ? activity.programAreaId
                      : activity.name
                    : "-";
                }
                return (
                  <View key={blockId} style={styles.cell}>
                    <Text>{activityText}</Text>
                  </View>
                );
              })}
              <View style={styles.dataCell}>
                <Text>{apoText}</Text>
              </View>

              {/* Freeplay assignment - Use dataCell style */}
              <View style={styles.dataCell}>
                <Text>
                  {fpBuddies
                    .map((fpBuddy) =>
                      fpBuddy ? getFullName(fpBuddy.snapshot.name) : "",
                    )
                    .join(", ")}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
