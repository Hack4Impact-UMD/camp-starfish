import {
  AdminAttendeeID,
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
} from "@/types/sessionTypes";
import { Document, Page, Text} from "@react-pdf/renderer";
import {
  getFreeplayAssignmentId,
  isBundleActivity,
  isIndividualAssignments,
} from "../generation/schedulingUtils";
import { getFullName } from "@/utils/personUtils";
import {createTw} from 'react-pdf-tailwind';
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        'bunk': '#d3d3d3',
      },
    },
  },
});

interface EmployeeGridProps<T extends SchedulingSectionType> {
  schedule: SectionScheduleID<T>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  employees: AdminAttendeeID[] | StaffAttendeeID[]; 
}

export default function EmployeeGrid<T extends SchedulingSectionType>(
  props: EmployeeGridProps<T>
) {
  const { schedule, freeplay, campers, employees } = props;
  return (
    <Document>
      <Page size="A4">
        <Table style={ [tw("p-[15px] text-[8px]"),{ fontFamily: "Helvetica" }]}>
        <Text style={tw("text-[12px] my-[6px] font-bold")}>{employees.length === 0 ? "Employee" : employees[0].role === "ADMIN" ? "Admin" : "Staff"} Assignments</Text>
        <TH style={tw("mb-[8px] border border-black")}>
          <TR style={tw("flex-row bg-black")}>
            <TD>
            <Text style={tw("flex-1 text-center text-[8px] font-bold text-white border border-black p-[1px] bg-black justify-center items-center")}>NAME</Text>
            {Object.keys(schedule.blocks).map((blockId) => (
              <Text key={blockId} style={tw("flex-1 text-center text-[8px] font-bold text-white border border-black p-[1px] bg-black justify-center items-center")}>
                {blockId}
              </Text>
            ))}
            </TD>
            <Text style={tw("flex-1 text-center text-[8px] font-bold text-white border border-black p-[1px] bg-black justify-center items-center")}>APO</Text>
            <Text style={tw("flex-1 text-center text-[8px] font-bold text-white border border-black p-[1px] bg-black justify-center items-center")}>AM/PM FP</Text>
          </TR>

          {employees.map((employee) => {
            const fpBuddyIds = getFreeplayAssignmentId(freeplay, employee.id);
            const fpBuddies = fpBuddyIds ? (fpBuddyIds as number[]).map(id => campers.find(c => c.id === id)) : [];

            let apoText: string = '-';
            for (const period of Object.keys(schedule.alternatePeriodsOff)) {
              if (schedule.alternatePeriodsOff[period].includes(employee.id)) {
                apoText = period;
                break;
              }
            }

            return (
              <TR key={employee.id} style={ tw("flex-row")}>
                {/* Name column - Use dataCell style */}
                <TD style={ tw("flex-1 p-[1px] border border-black bg-white justify-center items-center text-[7px]")}>
                  <Text>
                    {employee.name.firstName} {employee.name.lastName[0]}.
                  </Text>
                </TD>

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
                    <TD key={blockId} style={tw("flex-1 p-[1px] border border-black bg-white justify-center items-center")}>
                      <Text>{activityText}</Text>
                    </TD>
                  );
                })}

                <TD style={ tw("flex-1 p-[1px] border border-black bg-white justify-center items-center text-[7px]")}>
                  <Text>
                    {apoText}
                  </Text>
                </TD>

                {/* Freeplay assignment - Use dataCell style */}
                <TD style={ tw("flex-1 p-[1px] border border-black bg-white justify-center items-center text-[7px]")}>
                  <Text>
                    {fpBuddies.map(fpBuddy => fpBuddy ? getFullName(fpBuddy) : "").join(", ")}
                  </Text>
                </TD>
              </TR>
            );
          })}
        </TH>
        </Table>
      </Page>
    </Document>
  );
}
