import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  StaffAttendeeID,
  CamperAttendeeID,
  AdminAttendeeID,
  SectionSchedule,
  BunkID,
  Block,
  BundleBlockActivities,
  Freeplay,
  SchedulingSectionType,
} from "@/types/sessionTypes";

export type AttendeeRole = "CAMPER" | "STAFF" | "ADMIN";

/* ------------------ STYLES ------------------ */
/* ------------------ STYLES ------------------ */
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

// ------------------ MAIN DOCUMENT ------------------
const generateAdminGrid = <T extends SchedulingSectionType>(
  schedule: SectionSchedule<T>,
  freeplay: Freeplay,
  adminList: AdminAttendeeID[],
  camperList: CamperAttendeeID[]
) => (
  /*
   * used to return the admin table
   */
  <>
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

      {(() => {
        return adminList.map((admin) => {
          return (
            <View key={admin.id} style={styles.row}>
              {/* Name column - Use dataCell style */}
              <View style={styles.dataCell}>
                <Text>
                  {admin.name.firstName} {admin.name.lastName[0]}.
                </Text>
              </View>

              {/* Block assignments - Use dataCell style */}
              {renderStaffBlocks(schedule, admin)}

              <View style={styles.dataCell}>
                <Text>
                  {Object.values(schedule.alternatePeriodsOff).some((ids) =>
                    ids.includes(admin.id)
                  )
                    ? "RH"
                    : ""}
                </Text>
              </View>

              {/* Freeplay assignment - Use dataCell style */}
              {renderFreeplayAssignment(freeplay, admin.id, camperList)}
            </View>
          );
        });
      })()}
    </View>
  </>
);

const generateKidGrid = <T extends SchedulingSectionType>(
  schedule: SectionSchedule<T>,
  freeplay: Freeplay,
  camperList: CamperAttendeeID[],
  bunkList: BunkID[],
  staffList: StaffAttendeeID[]
) => (
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
              fpBuddyObj.name.middleName ? ` ${fpBuddyObj.name.middleName}` : ""
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

const generateStaffGrid = <T extends SchedulingSectionType>(
  schedule: SectionSchedule<T>,
  freeplay: Freeplay,
  staffList: StaffAttendeeID[],
  camperList: CamperAttendeeID[],
  bunkList: BunkID[]
) => (
  <>
    <Text style={styles.sectionTitle}>Staff Assignments</Text>
    <View style={styles.compactTable}>
      <View style={styles.headerRow}>
        <Text style={styles.compactHeaderCell}>NAME</Text>
        {Object.keys(schedule.blocks).map((blockId) => (
          <Text key={blockId} style={styles.compactHeaderCell}>
            {blockId}
          </Text>
        ))}
        <Text style={styles.compactHeaderCell}>APO</Text>
        <Text style={styles.compactHeaderCell}>FP</Text>
      </View>

      {(() => {
        let lastBunk: number | null = null;
        return sortBunkList(bunkList, staffList).map((staff) => {
          const isLead = staff.bunk !== lastBunk;
          lastBunk = staff.bunk;

          return (
            <View key={staff.id} style={styles.row}>
              <View style={styles.compactDataCell}>
                <Text style={isLead ? styles.bold : undefined}>
                  {staff.name.firstName} {staff.name.lastName}
                  {isLead && `(${staff.bunk})`}
                </Text>
              </View>

              {renderStaffBlocksCompact(schedule, staff)}

              <View style={styles.compactDataCell}>
                <Text>
                  {Object.values(schedule.alternatePeriodsOff).some((ids) =>
                    ids.includes(staff.id)
                  )
                    ? "RH"
                    : ""}
                </Text>
              </View>

              {renderFreeplayAssignmentCompact(freeplay, staff.id, camperList)}
            </View>
          );
        });
      })()}
    </View>
  </>
);

// ----------------- HELPERS ----------------

const sortedCampers = (bunkList: BunkID[], camperList: CamperAttendeeID[]) => {
  const sortedList: CamperAttendeeID[] = [];

  const camperDict: Record<number, CamperAttendeeID> = camperList.reduce(
    (acc, camper) => {
      acc[camper.id] = camper;
      return acc;
    },
    {} as Record<number, CamperAttendeeID>
  );

  // uses the dictionary to create the list of campers per bunk
  for (const bunk of bunkList) {
    const tempList: CamperAttendeeID[] = [];

    // Add the other counselors, skipping the lead if duplicated
    for (const camperId of bunk.camperIds) {
      const camper = camperDict[camperId];
      if (camper) tempList.push(camper);
    }

    // aggregates the per bunk list into the main sorted list
    sortedList.push(...tempList);
  }

  return sortedList;
};

const sortBunkList = (bunkList: BunkID[], staffList: StaffAttendeeID[]) => {
  /*
   * given a list of bunks and a list of staff, returns a sorted list of staff by bunk
   * the first person in each bunk is the lead counselor of the bunk (will be bolded)
   */
  const sortedList: StaffAttendeeID[] = [];

  // gets the staff as a dictionary mapping the ID number to their associated StaffAttendeeID object
  const staffDict: Record<number, StaffAttendeeID> = staffList.reduce(
    (acc, staff) => {
      acc[staff.id] = staff;
      return acc;
    },
    {} as Record<number, StaffAttendeeID>
  );

  // uses the dictionary to create the list of staff per bunk
  for (const bunk of bunkList) {
    const tempList: StaffAttendeeID[] = [];
    const lead = staffDict[bunk.leadCounselor];
    if (lead) tempList.push(lead);

    // Add the other counselors, skipping the lead if duplicated
    for (const counselorId of bunk.staffIds) {
      if (counselorId !== bunk.leadCounselor) {
        const counselor = staffDict[counselorId];
        if (counselor) tempList.push(counselor);
      }
    }

    // aggregates the per bunk list into the main sorted list
    sortedList.push(...tempList);
  }

  return sortedList;
};

const freeplayBuddy = (freeplay: Freeplay, camper: CamperAttendeeID) => {
  /*
   * given the freeplay object and a camper ID, finds the staff associated with them
   */

  let savedId: number = -1;

  for (const [staffId, camperIds] of Object.entries(freeplay.buddies)) {
    if (camperIds.includes(camper.id)) {
      savedId = Number(staffId);
      break;
    }
  }

  return savedId;
};

// Finds which activities a camper is assigned to in a given block.
// Returns a comma-separated list of activity names, or "OFF" if none.
const renderCamperBlockAssignment = <T extends SchedulingSectionType>(
  block: Block<T>,
  camperId: number
) => {
  const camperActivities = (block.activities as BundleBlockActivities).filter(
    (activity) => activity.assignments.camperIds.includes(camperId)
  );

  return camperActivities.length > 0
    ? camperActivities.map((activity) => activity.name).join(", ")
    : "OFF";
};

// Displays each staff member’s assignment across all schedule blocks.
// Shows “OFF” if in periodsOff, the activity name if assigned, or “-” if none.
const renderStaffBlocks = <T extends SchedulingSectionType>(
  schedule: SectionSchedule<T>,
  staff: StaffAttendeeID | AdminAttendeeID
) => {
  return Object.entries(schedule.blocks).map(([blockId, block]) => {
    // See if staff is OFF
    if (block.periodsOff.includes(staff.id)) {
      return (
        <View key={blockId} style={styles.cell}>
          <Text>OFF</Text>
        </View>
      );
    }

    // Find activities staff is assigned to
    const activities = block.activities.filter((a) => {
      if (staff.role === "STAFF") {
        return 'staffIds' in a.assignments ? a.assignments.staffIds.includes(staff.id) : a.assignments.bunkNums.includes(staff.bunk)
      }
      return a.assignments.adminIds.includes(staff.id);
    });

    return (
      <View key={blockId} style={styles.cell}>
        {activities.length > 0 ? (
          // activities.map((a, idx) => <Text key={idx}>{a.name}</Text>)
          <Text>{activities[0].name}</Text>
        ) : (
          <Text>-</Text>
        )}
      </View>
    );
  });
};

// Helper to render Freeplay assignment
// Renders a staff member’s Freeplay assignment: either their buddy/buddies or post.
// If unassigned, displays “OFF”.
const renderFreeplayAssignment = (
  freeplay: Freeplay,
  staffId: number,
  campers: CamperAttendeeID[]
) => {
  // If staff has a buddy assignment
  if (freeplay.buddies[staffId]) {
    const buddyIds = freeplay.buddies[staffId];
    const buddies = campers.filter((c) => buddyIds.includes(c.id));

    if (buddies.length === 1) {
      const b = buddies[0];
      return (
        <View style={styles.cell}>
          <Text>
            {b.name.firstName} {b.name.lastName[0]}. ({b.bunk})
          </Text>
        </View>
      );
    } else if (buddies.length === 2) {
      const [b1, b2] = buddies;
      return (
        <View style={styles.cell}>
          <Text>
            {b1.name.firstName} {b1.name.lastName[0]}. + {b2.name.firstName}{" "}
            {b2.name.lastName[0]}. ({b1.bunk})
          </Text>
        </View>
      );
    }
  }

  // If staff is assigned to a Freeplay post
  const postEntry = Object.entries(freeplay.posts).find(([, ids]) =>
    ids.includes(staffId)
  );
  if (postEntry) {
    const [postName] = postEntry;
    return (
      <View style={styles.cell}>
        <Text>{postName}</Text>
      </View>
    );
  }

  return (
    <View style={styles.cell}>
      <Text>OFF</Text>
    </View>
  );
};

const renderStaffBlocksCompact = <T extends SchedulingSectionType>(
  schedule: SectionSchedule<T>,
  staff: StaffAttendeeID
) => {
  return Object.entries(schedule.blocks).map(([blockId, block]) => {
    if (block.periodsOff.includes(staff.id)) {
      return (
        <View key={blockId} style={styles.compactDataCell}>
          <Text>OFF</Text>
        </View>
      );
    }

    const activities = block.activities.filter((a) =>
      'staffIds' in a.assignments ? a.assignments.staffIds.includes(staff.id) : a.assignments.bunkNums.includes(staff.bunk)
    );

    return (
      <View key={blockId} style={styles.compactDataCell}>
        {activities.length > 0 ? (
          <Text>{activities[0].name}</Text>
        ) : (
          <Text>-</Text>
        )}
      </View>
    );
  });
};

const renderFreeplayAssignmentCompact = (
  freeplay: Freeplay,
  staffId: number,
  campers: CamperAttendeeID[]
) => {
  if (freeplay.buddies[staffId]) {
    const buddyIds = freeplay.buddies[staffId];
    const buddies = campers.filter((c) => buddyIds.includes(c.id));

    if (buddies.length === 1) {
      const b = buddies[0];
      return (
        <View style={styles.compactDataCell}>
          <Text>
            {b.name.firstName} {b.name.lastName[0]}. ({b.bunk})
          </Text>
        </View>
      );
    } else if (buddies.length === 2) {
      const [b1, b2] = buddies;
      return (
        <View style={styles.compactDataCell}>
          <Text>
            {b1.name.firstName} {b1.name.lastName[0]}. + {b2.name.firstName}{" "}
            {b2.name.lastName[0]}. ({b1.bunk})
          </Text>
        </View>
      );
    }
  }

  const postEntry = Object.entries(freeplay.posts).find(([, ids]) =>
    ids.includes(staffId)
  );
  if (postEntry) {
    const [postName] = postEntry;
    return (
      <View style={styles.compactDataCell}>
        <Text>{postName}</Text>
      </View>
    );
  }

  return (
    <View style={styles.compactDataCell}>
      <Text>OFF</Text>
    </View>
  );
};