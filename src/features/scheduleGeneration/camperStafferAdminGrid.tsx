import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import {
  StaffAttendeeID,
  CamperAttendeeID,
  AdminAttendeeID, 
  SectionSchedule, 
  BunkID,
  Block, 
  BundleBlockActivities, 
  Freeplay } from "@/types/sessionTypes";

export type AttendeeRole = "CAMPER" | "STAFF" | "ADMIN";

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  sectionTitle: {
    fontSize: 14,
    marginVertical: 8,
    fontWeight: "bold"
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingVertical: 2
  },
  cell: {
    flex: 1,
    padding: 2
  },
  bold: {
    fontWeight: "bold"
  },
  table: {
    marginBottom: 12
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 4,
  },
  headerCell: {
    flex: 1,                // distribute evenly
    textAlign: "center",    // center column titles
    fontSize: 10,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 2,
  },
});

// ------------------ MAIN DOCUMENT ------------------ 
const renderStaff = (
  schedule: SectionSchedule<"BUNDLE">,
  freeplay: Freeplay,
  staffList: StaffAttendeeID[],
  camperList: CamperAttendeeID[],
  bunkList: BunkID[],
) => (
  <>
    <Text style={styles.sectionTitle}>Staff Assignments</Text>
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>NAME</Text>
        {["A", "B", "C", "D", "E"].map((block) => (
          <Text key={block} style={styles.headerCell}>
            {block}
          </Text>
        ))}
        <Text style={styles.headerCell}>APO</Text>
        <Text style={styles.headerCell}>AM/PM FP</Text>
      </View>

      {(() => {
        let lastBunk: number | null = null;

        return sortBunkList(bunkList, staffList).map((staff) => {
          const isLead = staff.bunk !== lastBunk; // first staffer for this bunk
          lastBunk = staff.bunk; // update tracker

          return (
            <View key={staff.id} style={styles.row}>
              {/* Name column */}
              <View style={styles.cell}>
                <Text style={isLead ? styles.bold : undefined}>
                  {staff.name.firstName} {staff.name.lastName}
                  {isLead && `(${staff.bunk})`}
                </Text>
              </View>

              {/* Block assignments */}
              {renderStaffBlocks(schedule, staff.id)}

              <View style={styles.cell}>
                <Text>
                  {Object.values(schedule.alternatePeriodsOff).some(ids => ids.includes(staff.id)) ? "RH" : ""}
                </Text>
              </View>

              {/* Freeplay assignment */}
              {renderFreeplayAssignment(freeplay, staff.id, camperList)}
            </View>
          );
        });
      })()}
    </View>
  </>
);

const renderCampers = ( schedule: SectionSchedule<"BUNDLE">, freeplay: Freeplay, camperList: CamperAttendeeID[] ) => (
  <>
    <Text style={styles.sectionTitle}>Kid Grid</Text>


    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>BUNK</Text>
        <Text style={styles.headerCell}>NAME</Text>
        {["A", "B", "C", "D", "E"].map((block) => (
          <Text key={block} style={styles.headerCell}>
            {block}
          </Text>
        ))}
        <Text style={styles.headerCell}>+</Text>
        <Text style={styles.headerCell}>AM/PM FP</Text>
      </View>

      {/* Body Rows */}
      {camperList.map((camper) => {
        const blocksArray = Object.values(schedule.blocks);
        const fpBuddy = freeplayBuddy(freeplay, camper);

        return (
          <View key={camper.id} style={styles.row}>
            {/* BUNK */}
            <View style={styles.cell}>
              <Text>{camper.bunk}</Text>
            </View>

            {/* NAME */}
            <View style={styles.cell}>
              <Text>
                {[camper.name.firstName, camper.name.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            </View>

            {/* BLOCKS A–E */}
            {blocksArray.map((block, i) => (
              <View key={i} style={styles.cell}>
                <Text>{ renderCamperBlockAssignment(block, camper.id) }</Text>
              </View>
            ))}

            <View style={styles.cell}>
              <Text>
                -
              </Text>
            </View>

            {/* FREEPLAY */}
            <View style={styles.cell}>
              <Text>
                {fpBuddy ? `${fpBuddy}` : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  </>
);

const renderAdmin = ( schedule: SectionSchedule<"BUNDLE">, freeplay: Freeplay, adminList: AdminAttendeeID[], camperList: CamperAttendeeID[] ) => (
  <>
    <Text style={styles.sectionTitle}>Admin Assignments</Text>
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>NAME</Text>
        {["A", "B", "C", "D", "E"].map((block) => (
          <Text key={block} style={styles.headerCell}>
            {block}
          </Text>
        ))}
        <Text style={styles.headerCell}>APO</Text>
        <Text style={styles.headerCell}>AM/PM FP</Text>
      </View>

      {(() => {
        return adminList.map((admin) => {
          return (
            <View key={admin.id} style={styles.row}>
              {/* Name column */}
              <View style={styles.cell}>
                <Text>
                  {admin.name.firstName} {admin.name.lastName[0]}.
                </Text>
              </View>

              {/* Block assignments */}
              {renderStaffBlocks(schedule, admin.id)}

              <View style={styles.cell}>
                <Text>
                  {Object.values(schedule.alternatePeriodsOff).some(ids => ids.includes(admin.id)) ? "RH" : ""}
                </Text>
              </View>

              {/* Freeplay assignment */}
              {renderFreeplayAssignment(freeplay, admin.id, camperList)}
            </View>
          );
        });
      })()}
    </View>
  </>
);




// ----------------- HELPERS ----------------

const sortBunkList = ( bunkList: BunkID[], staffList: StaffAttendeeID[]) => {
  const sortedList: StaffAttendeeID[] = [];

  const staffDict: Record<number, StaffAttendeeID> = staffList.reduce(
    (acc, staff) => {
      acc[staff.id] = staff;
      return acc;
    },
    {} as Record<number, StaffAttendeeID>
  );

  for (const bunk of bunkList) {
    const tempList = [];
    tempList.push(staffDict[bunk.leadCounselor]);
    for (const counselor of bunk.staffIds) {
      tempList.push(staffDict[counselor]);
    }
    sortedList.push(...tempList);
  }

  return sortedList;
}

const freeplayBuddy = ( freeplay: Freeplay, camper: CamperAttendeeID) => {
  let savedId: string = "";
  for (const [staffId, camperIds] of Object.entries(freeplay.buddies)) {
    if (camperIds.includes(camper.id)) {
      savedId = staffId;
      break;
    }
  }

  return (
    { savedId }
  );
};

const renderCamperBlockAssignment = (block: Block<"BUNDLE">, camperId: number) => {
  const camperActivities = (block.activities as BundleBlockActivities).filter((activity) =>
    activity.assignments.camperIds.includes(camperId)
  );

  return camperActivities.length > 0
    ? camperActivities.map((activity) => activity.name).join(", ")
    : "OFF";
};

const renderStaffBlocks = (schedule: SectionSchedule<"BUNDLE">, staffId: number) => {
  return Object.entries(schedule.blocks).map(([blockId, block]) => {
    // See if staff is OFF
    if (block.periodsOff.includes(staffId)) {
      return (
        <View key={blockId} style={styles.cell}>
          <Text>OFF</Text>
        </View>
      );
    }

    // Find activities staff is assigned to
    const activities = block.activities.filter((a) =>
      a.assignments.staffIds.includes(staffId)
    );

    return (
      <View key={blockId} style={styles.cell}>
        {activities.length > 0 ? (
          activities.map((a, idx) => <Text key={idx}>{a.name}</Text>)
        ) : (
          <Text>-</Text>
        )}
      </View>
    );
  });
};

// Helper to render Freeplay assignment
const renderFreeplayAssignment = ( freeplay: Freeplay, staffId: number, campers: CamperAttendeeID[] ) => {
  // If staff has a buddy assignment
  if (freeplay.buddies[staffId]) {
    const buddyIds = freeplay.buddies[staffId];
    const buddies = campers.filter((c) => buddyIds.includes(c.id));

    if (buddies.length === 1) {
      const b = buddies[0];
      return (
        <View style={styles.cell}>
          <Text>{b.name.firstName} {b.name.lastName[0]}. ({b.bunk})</Text>
        </View>
      );
    } else if (buddies.length === 2) {
      const [b1, b2] = buddies;
      return (
        <View style={styles.cell}>
          <Text>
            {b1.name.firstName} {b1.name.lastName[0]}. + {b2.name.firstName} {b2.name.lastName[0]}. ({b1.bunk})
          </Text>
        </View>
      );
    }
  }

  // If staff is assigned to a Freeplay post
  const postEntry = Object.entries(freeplay.posts).find(([postName, ids]) =>
    ids.includes(staffId)
  );
  if (postEntry) {
    const [postName] = postEntry;
    return (
      <View style={styles.cell}>
        <Text>{ postName }</Text>
      </View>
    )
  }

  return (
    <View style={styles.cell}>
      <Text>OFF</Text>
    </View>
  );
};




// ------------------ MAIN DOCUMENT ------------------
export const SchedulePDF: React.FC<{
    schedule: SectionSchedule<'BUNDLE'>,
    freeplay: Freeplay,
    staff: StaffAttendeeID[],
    admin: AdminAttendeeID[],
    campers: CamperAttendeeID[],
    bunkList: BunkID[] }> =
  ({ schedule, freeplay, staff, admin, campers, bunkList }) => (
  <PDFViewer style={{ width: "100%", height: "100vh" }}>
    <Document>
      <Page size="A4" style={styles.page}>
        {renderStaff(schedule, freeplay, staff, campers, bunkList)}
        {renderCampers(schedule, freeplay, campers)}
        {renderAdmin(schedule, freeplay, admin, campers)}
      </Page>
    </Document>
  </PDFViewer>
);
