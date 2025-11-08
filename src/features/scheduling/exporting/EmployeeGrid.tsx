import {
  AdminAttendeeID,
  BunkID,
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
} from "@/types/sessionTypes";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  getFreeplayAssignmentId,
  isBundleActivity,
  isIndividualAssignments,
} from "../generation/schedulingUtils";
import { get } from "http";
import { getFullName } from "@/utils/personUtils";

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

interface EmployeeGridProps<T extends SchedulingSectionType> {
  schedule: SectionScheduleID<T>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  bunks: BunkID[];
  employees: (AdminAttendeeID | StaffAttendeeID)[];
}

export default function EmployeeGrid<T extends SchedulingSectionType>(
  props: EmployeeGridProps<T>
) {
  const { schedule, freeplay, campers, bunks, employees } = props;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Admin Assignments</Text>
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

          {employees.map((employee) => {
            const fpBuddyIds = getFreeplayAssignmentId(freeplay, employee.id);
            const fpBuddies = fpBuddyIds ? (fpBuddyIds as number[]).map(id => campers.find(c => c.id === id)) : [];

            return (
              <View key={employee.id} style={styles.row}>
                {/* Name column - Use dataCell style */}
                <View style={styles.dataCell}>
                  <Text>
                    {employee.name.firstName} {employee.name.lastName[0]}.
                  </Text>
                </View>

                {/* Block assignments - Use dataCell style */}
                {Object.entries(schedule.blocks).map(([blockId, block]) => {
                  let activityText;
                  if (block.periodsOff.includes(employee.id)) {
                    activityText = "OFF";
                  } else if (employee.role === "STAFF") {
                    const activity = block.activities.find((act) =>
                      isIndividualAssignments(act.assignments)
                        ? act.assignments.staffIds.includes(employee.id)
                        : act.assignments.bunkNums.includes(employee.bunk)
                    );
                    activityText = activity
                      ? isBundleActivity(activity)
                        ? activity.programArea.id
                        : activity.name
                      : "-";
                  } else {
                    const activity = block.activities.find((act) =>
                      act.assignments.adminIds.includes(employee.id)
                    );
                    activityText = activity
                      ? isBundleActivity(activity)
                        ? activity.programArea.id
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
                  <Text>
                    {Object.values(schedule.alternatePeriodsOff).some((ids) =>
                      ids.includes(employee.id)
                    )
                      ? "RH"
                      : ""}
                  </Text>
                </View>

                {/* Freeplay assignment - Use dataCell style */}
                <View style={styles.dataCell}>
                  <Text>
                    {fpBuddies.map(fpBuddy => fpBuddy ? getFullName(fpBuddy) : "").join(", ")}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
