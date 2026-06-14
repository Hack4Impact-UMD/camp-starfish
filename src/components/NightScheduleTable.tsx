import { useCallback, useMemo } from "react";
import { Table, Text } from "@mantine/core";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  NightSchedule,
  Attendee,
  NightSchedulePosition,
  StaffAttendee,
  Session,
  DaysOffSchedule,
} from "@/types/sessions/sessionTypes";
import { getFullName } from "@/types/users/userUtils";
import moment from "moment";
import useListAttendees from "@/hooks/attendees/useListAttendees";
import useNightScheduleList from "@/hooks/nightSchedules/useNightScheduleList";
import {
  getAttendeesById,
  groupAttendeesByBunk,
} from "@/features/scheduling/generation/schedulingUtils";
import LoadingPage from "@/app/loading";
import {
  getNightSchedulePositionAbbreviation,
  NIGHT_SCHEDULE_POSITIONS,
} from "@/types/sessions/nightScheduleUtils";
import useSession from "@/hooks/sessions/useSession";
import { getDayNumOfSession } from "@/types/sessions/sessionUtils";
import useDaysOffSchedule from "@/hooks/daysOffSchedules/useDaysOffSchedule";

interface NightScheduleTableProps {
  sessionId: string;
}

type NightScheduleTablePosition = NightSchedulePosition | "DAY OFF"

function getNightScheduleTablePositionAbbreviation(position: NightScheduleTablePosition): string {
  if (position === "DAY OFF") {
    return "DO";
  }
  return getNightSchedulePositionAbbreviation(position);
}

export default function NightScheduleTable(props: NightScheduleTableProps) {
  const { sessionId } = props;

  const { data: daysOffSchedule, status: daysOffScheduleStatus } = useDaysOffSchedule(sessionId);
  const { data: session, status: sessionStatus } = useSession(sessionId);
  const { data: attendees = [], status: attendeesStatus } =
    useListAttendees(sessionId);
  const { data: nightShifts, status: nightShiftsStatus } =
    useNightScheduleList(sessionId);

  if (
    daysOffScheduleStatus === "error" ||
    sessionStatus === "error" ||
    attendeesStatus === "error" ||
    nightShiftsStatus === "error"
  ) {
    return <p>Error loading session data</p>;
  } else if (
    daysOffScheduleStatus === "pending" ||
    sessionStatus === "pending" ||
    attendeesStatus === "pending" ||
    nightShiftsStatus === "pending"
  ) {
    return <LoadingPage />;
  }

  return (
    <NightScheduleTableContent
      daysOffSchedule={daysOffSchedule}
      session={session}
      attendees={attendees}
      nightShifts={nightShifts.docs}
    />
  );
}

interface NightScheduleTableContentProps {
  daysOffSchedule: DaysOffSchedule;
  session: Session;
  attendees: Attendee[];
  nightShifts: NightSchedule[];
}

interface NightScheduleTableRow {
  date: string;
  position: NightScheduleTablePosition;
  bunks: Record<number, StaffAttendee[]>;
}

function NightScheduleTableContent(props: NightScheduleTableContentProps) {
  const { daysOffSchedule, session, attendees, nightShifts } = props;

  const { staffById, staffByBunk, bunkNums } = useMemo(() => {
    const staff = attendees.filter((att: Attendee) => att.role === "STAFF");
    const staffById = getAttendeesById(staff);
    const staffByBunk = groupAttendeesByBunk(staff);
    const bunkNums = Object.keys(staffByBunk)
      .map((bunkNum) => Number(bunkNum))
      .sort((a, b) => a - b);
    return { staffById, staffByBunk, bunkNums };
  }, [attendees]);

  const getStaffForPosition = useCallback(
    (
      nightShift: NightSchedule,
      bunkNum: number,
      position: NightScheduleTablePosition,
    ): StaffAttendee[] => {
      const bunkData = nightShift.bunks[bunkNum];

      const date = nightShift.date;

      switch (position) {
        case "NIGHT-BUNK-DUTY": {
          return bunkData["NIGHT-BUNK-DUTY"].map(
            (staffId) => staffById[staffId],
          );
        }
        case "COUNSELOR-ON-DUTY": {
          return bunkData["COUNSELOR-ON-DUTY"].map(
            (staffId) => staffById[staffId],
          );
        }
        case "DAY OFF": {
          const staffInBunk: number[] = Array.from(
            staffByBunk[bunkNum].map((att) => att.attendeeId) || [],
          );
          const staffOff = staffInBunk.filter((staffId: number) => {
            return daysOffSchedule.daysOffByCounselorId[staffId].some((dayOff) => dayOff.isSame(date, "day"));
          });
          return staffOff.map((staffId: number) => staffById[staffId]);
        }
        case "ROVER": {
          const allStaffInBunk: number[] = Array.from(
            staffByBunk[bunkNum].map((att) => att.attendeeId) || [],
          );
          const assignedStaff = new Set([
            ...bunkData["NIGHT-BUNK-DUTY"],
            ...bunkData["COUNSELOR-ON-DUTY"],
          ]);

          const roverStaff = allStaffInBunk.filter((staffId: number) => {
            if (assignedStaff.has(staffId)) return false;
            if (daysOffSchedule.daysOffByCounselorId[staffId].some((dayOff) => dayOff.isSame(date, "day")))
              return false;
            return true;
          });

          return roverStaff.map((staffId: number) => staffById[staffId]);
        }
        default:
          return [];
      }
    },
    [staffByBunk, staffById, daysOffSchedule.daysOffByCounselorId],
  );

  const data: NightScheduleTableRow[] = useMemo(() => {
    const rows: NightScheduleTableRow[] = [];
    nightShifts.forEach((nightShift: NightSchedule) => {
      NIGHT_SCHEDULE_POSITIONS.forEach((position: NightSchedulePosition) => {
        const row: NightScheduleTableRow = {
          date: nightShift.date,
          position: position,
          bunks: bunkNums.map((bunkNum) =>
            getStaffForPosition(nightShift, bunkNum, position),
          ),
        };
        rows.push(row);
      });
    });
    return rows;
  }, [nightShifts, bunkNums, getStaffForPosition]);

  const columns = useMemo<ColumnDef<NightScheduleTableRow>[]>(() => {
    const cols: ColumnDef<NightScheduleTableRow>[] = [
      {
        accessorKey: "day",
        header: "DAY",
        size: 120,
        cell: ({ row }) => (
          <div>
            <Text className="text-sm font-semibold">
              Day {getDayNumOfSession(row.original.date, session)}
            </Text>
            <Text className="text-xs font-semibold text-gray-6">
              {moment(row.original.date).format("MMM D, YYYY")}
            </Text>
          </div>
        ),
      },
      {
        accessorFn: (row) => getNightScheduleTablePositionAbbreviation(row.position),
        header: "POSITION",
        size: 100,
      },
    ];

    bunkNums.forEach((bunkNum: number) => {
      cols.push({
        accessorFn: (row: NightScheduleTableRow) =>
          row.bunks[bunkNum] &&
          row.bunks[bunkNum]
            .map((staff) => getFullName(staff.snapshot.name))
            .join(", "),
        header: `BUNK ${bunkNum}`,
      });
    });

    return cols;
  }, [bunkNums, session]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      className="border-collapse"
    >
      <Table.Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.Th
                key={header.id}
                className="text-center bg-gray-200 py-3 px-2 border border-gray-300 font-semibold"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </Table.Th>
            ))}
          </Table.Tr>
        ))}
      </Table.Thead>
      <Table.Tbody>
        {table.getRowModel().rows.map((row) => {
          const isFirstPositionInDay =
            row.original.position === "COUNSELOR-ON-DUTY";

          return (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => {
                if (cellIndex === 0) {
                  if (!isFirstPositionInDay) {
                    return null;
                  }
                  return (
                    <Table.Td
                      key={cell.id}
                      rowSpan={NIGHT_SCHEDULE_POSITIONS.length}
                      className="text-center align-middle font-semibold bg-gray-200 border border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Td>
                  );
                }

                if (cellIndex === 1) {
                  return (
                    <Table.Td
                      key={cell.id}
                      className="text-center font-medium border border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Td>
                  );
                }

                return (
                  <Table.Td
                    key={cell.id}
                    className="text-center border border-gray-300 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
