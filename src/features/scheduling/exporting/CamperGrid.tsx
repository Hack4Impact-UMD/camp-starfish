import {
  BunkID,
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
} from "@/types/sessionTypes";
import { StyleSheet, View, Text } from "@react-pdf/renderer";

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

interface CamperGridProps<T extends SchedulingSectionType> {
  schedule: SectionScheduleID<T>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  bunks: BunkID[];
  staff: StaffAttendeeID[];
}

export default function CamperGrid<T extends SchedulingSectionType>(
  props: CamperGridProps<T>
) {
  const { schedule, freeplay, campers, bunks, staff } = props;
  return (
    <>
      <Text style={styles.sectionTitle}>Kid Grid</Text>
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

        {sortedCampers(bunkList, camperList).map((camper) => {
          const blocksArray = Object.values(schedule.blocks);
          const fpBuddy = freeplayBuddy(freeplay, camper);
          const fpBuddyObj = staffList.find((staff) => staff.id === fpBuddy);
          const fpBuddyName = fpBuddyObj
            ? `${fpBuddyObj.name.firstName}${
                fpBuddyObj.name.middleName
                  ? ` ${fpBuddyObj.name.middleName}`
                  : ""
              } ${fpBuddyObj.name.lastName}`
            : "N/A";

          return (
            <View key={camper.id} style={styles.row}>
              <View style={styles.compactBunkCell}>
                <Text>{camper.bunk}</Text>
              </View>

              <View style={styles.compactDataCell}>
                <Text>
                  {[camper.name.firstName, camper.name.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              </View>

              {blocksArray.map((block, i) => (
                <View key={i} style={styles.compactDataCell}>
                  <Text>{renderCamperBlockAssignment(block, camper.id)}</Text>
                </View>
              ))}

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
    </>
  );
}
