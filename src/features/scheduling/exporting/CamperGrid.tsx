import {
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
} from "@/types/sessionTypes";
import { getFullName } from "@/utils/personUtils";
import { Text, Document, Page} from "@react-pdf/renderer";
import {
  getFreeplayAssignmentId,
  isBundleActivity,
  isIndividualAssignments,
} from "../generation/schedulingUtils";
import { tw } from "@/utils/reactPdfTailwind";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

interface CamperGridProps<T extends SchedulingSectionType> {
  schedule: SectionScheduleID<T>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
}

export default function CamperGrid<T extends SchedulingSectionType>(
  props: CamperGridProps<T>
) {
  const { schedule, freeplay, campers } = props;

  campers.sort((a, b) => {
    if (a.bunk === b.bunk) {
      if (getFullName(a).localeCompare(getFullName(b)) === 0) {
        return a.id - b.id;
      }
      return getFullName(a).localeCompare(getFullName(b));
    }
    return a.bunk - b.bunk;
  });

  const blockIds = Object.keys(schedule.blocks);
  const blocksArray = Object.values(schedule.blocks);

  return (
    <Document>
      <Page size="A4" style={[tw("p-[15px] text-[8px]"), { fontFamily: "Helvetica" }]}>
        <Text style={tw("text-[12px] my-[6px] font-bold")}>KID GRID</Text>
        
        <Table style={[tw("mb-[8px]"), { width: "33.33%" }]}>
          {/* Header Row */}
          <TR style={tw("bg-black")}>
            <TH style={tw("text-center text-[7px] font-bold text-white p-[1px] width: 30px")}>
            </TH>
            <TH style={tw("text-center text-[7px] font-bold text-white p-[1px] width: 35px" )}>
              <Text>NAME</Text>
            </TH>
            {blockIds.map((blockId) => (
              <TH
                key={blockId}
                style={[tw("text-center text-[7px] font-bold text-white p-[1px]"), { width: "30px" }]}
              >
                <Text>{blockId}</Text>
              </TH>
            ))}
            <TH style={[tw("text-center text-[7px] font-bold text-white p-[1px]"), { width: "25px" }]}>
              <Text>+</Text>
            </TH>
            <TH style={[tw("text-center text-[7px] font-bold text-white p-[1px]"), { width: "25px" }]}>
              <Text>FP</Text>
            </TH>
          </TR>

          {/* Data Rows */}
          {campers.map((camper) => {
            const fpAssignment = getFreeplayAssignmentId(freeplay, camper.id);
            
            // Get activity code for FP column
            let fpActivityCode = "-";
            if (fpAssignment) {
              if (typeof fpAssignment === "string") {
                // If it's a string, it's a postId (activity code)
                fpActivityCode = fpAssignment;
              } else if (typeof fpAssignment === "number") {
                // If it's a number, it's a staffId - find what post they're assigned to
                for (const [postId, employeeIds] of Object.entries(freeplay.posts)) {
                  if (employeeIds.includes(fpAssignment)) {
                    fpActivityCode = postId;
                    break;
                  }
                }
              }
            }

            return (
              <TR key={camper.id}>
                {/* Bunk Column */}
                <TD style={[tw("p-[1px] bg-bunk text-center text-[6px]"), { width: "10px" }]}>
                  <Text>{camper.bunk}</Text>
                </TD>

                {/* Name Column */}
                <TD style={[tw("p-[1px] bg-white text-left text-[6px]"), { width: "50px" }]}>
                  <Text>
                    {camper.name.firstName} {camper.name.lastName[0]}.
                  </Text>
                </TD>

                {/* Block Activity Columns */}
                {blocksArray.map((block, i) => {
                  const activity = block.activities.find((act) =>
                    isIndividualAssignments(act.assignments)
                      ? act.assignments.camperIds.includes(camper.id)
                      : act.assignments.bunkNums.includes(camper.bunk)
                  );

                  let activityText;
                  if (!activity) {
                    activityText = "";
                  } else if (isBundleActivity(activity)) {
                    activityText = activity.programArea.id;
                  } else {
                    activityText = activity.name;
                  }

                  return (
                    <TD key={i} style={[tw("p-[1px] bg-white text-center text-[6px]"), { width: "20px" }]}>
                      <Text>{activityText}</Text>
                    </TD>
                  );
                })}

                {/* Plus Column */}
                <TD style={[tw("p-[1px] bg-white text-center text-[6px]"), { width: "20px" }]}>
                </TD>

                {/* Freeplay Column */}
                <TD style={[tw("p-[1px] bg-white text-center text-[6px]"), { width: "20px" }]}>
                  <Text>{fpActivityCode}</Text>
                </TD>
              </TR>
            );
          })}
        </Table>
      </Page>
    </Document>
  );
}
