import {
  CamperAttendee,
  Freeplay,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { getFullName } from "@/types/users/userUtils";
import { StyleSheet, View, Text } from "@react-pdf/renderer";
import { getFreeplayAssignmentId } from "../generation/schedulingUtils";
import {
  isBundleActivity,
  isBunkJamboreeBlock,
} from "@/types/scheduling/schedulingTypeGuards";

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

interface CamperGridProps {
  schedule: SectionSchedule;
  freeplay: Freeplay;
  campers: CamperAttendee[];
  staff: StaffAttendee[];
}

export default function CamperGrid(props: CamperGridProps) {
  const { schedule, freeplay, campers, staff } = props;

  campers.sort((a, b) => {
    if (a.bunk === b.bunk) {
      if (
        getFullName(a.snapshot.name).localeCompare(
          getFullName(b.snapshot.name),
        ) === 0
      ) {
        return a.attendeeId - b.attendeeId;
      }
      return getFullName(a.snapshot.name).localeCompare(
        getFullName(b.snapshot.name),
      );
    }
    return a.bunk - b.bunk;
  });

  return (
    <View>
      <Text style={styles.sectionTitle}>Camper Grid</Text>
      <View style={styles.compactTable}>
        <View style={styles.headerRow}>
          <Text style={styles.compactHeaderCell}>BUNK</Text>
          <Text style={styles.compactHeaderCell}>NAME</Text>
          {Object.keys(schedule.blocks).map((blockId) => (
            <Text key={blockId} style={styles.compactHeaderCell}>
              {blockId}
            </Text>
          ))}
          <Text style={styles.compactHeaderCell}>+</Text>
          <Text style={styles.compactHeaderCell}>FP</Text>
        </View>

        {campers.map((camper) => {
          const fpBuddyId = getFreeplayAssignmentId(
            freeplay,
            camper.attendeeId,
          );
          const fpBuddyObj = staff.find(
            (staff) => staff.attendeeId === fpBuddyId,
          );
          const fpBuddyName = fpBuddyObj
            ? getFullName(fpBuddyObj.snapshot.name)
            : "N/A";

          return (
            <View key={camper.attendeeId} style={styles.row}>
              <View style={styles.compactBunkCell}>
                <Text>{camper.bunk}</Text>
              </View>

              <View style={styles.compactDataCell}>
                <Text>{getFullName(camper.snapshot.name)}</Text>
              </View>
              {Object.keys(schedule.blocks).map((blockId, i) => {
                const block = schedule.blocks[blockId];
                const activity = isBunkJamboreeBlock(block)
                  ? block.activities.find((act) =>
                      act.bunkNums.includes(camper.bunk),
                    )
                  : block.activities.find((act) =>
                      act.camperIds.includes(camper.attendeeId),
                    );
                return (
                  <View key={i} style={styles.compactDataCell}>
                    <Text>
                      {activity
                        ? isBundleActivity(activity)
                          ? activity.programAreaId
                          : activity.name
                        : "-"}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.compactDataCell}>
                <Text>-</Text>
              </View>
              <View style={styles.compactDataCell}>
                <Text>{fpBuddyName}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
