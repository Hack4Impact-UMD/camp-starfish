import { useMemo } from "react";
import { Table, Text } from "@mantine/core";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  NightShiftID,
  AttendeeID,
  NightSchedulePosition,
  StaffAttendeeID,
  SessionID,
} from "@/types/sessionTypes";
import { getFullName } from "@/utils/personUtils";
import moment from "moment";
import useAttendeesBySessionId from "@/hooks/attendees/useAttendeesBySessionId";
import useNightShiftsBySessionId from "@/hooks/nightShifts/useNightShiftsBySessionId";
import {
  getAttendeesById,
  groupAttendeesByBunk,
} from "@/features/scheduling/generation/schedulingUtils";
import LoadingPage from "@/app/loading";
import {
  getNightSchedulePositionAbbreviation,
  nightSchedulePositions,
} from "@/utils/nightShiftUtils";
import useSession from "@/hooks/sessions/useSession";
import { getDayNumOfSession } from "@/utils/sessionUtils";

interface NightScheduleTableProps {
  sessionId: string;
}

export default function NightScheduleTable(props: NightScheduleTableProps) {
  const { sessionId } = props;

  const { data: session, status: sessionStatus } = useSession(sessionId);
  const { data: attendees = [], status: attendeesStatus } =
    useAttendeesBySessionId(sessionId);
  const { data: nightShifts = [], status: nightShiftsStatus } =
    useNightShiftsBySessionId(sessionId);

  if (sessionStatus === 'error' || attendeesStatus === 'error' || nightShiftsStatus === 'error') {
    return <p>Error loading session data</p>;
  } else if (sessionStatus === 'pending' || attendeesStatus === 'pending' || nightShiftsStatus === 'pending') {
    return <LoadingPage />;
  }

  return <NightScheduleTableContent
    session={session}
    attendees={attendees}
    nightShifts={nightShifts}
  />
}

interface NightScheduleTableContentProps {
  session: SessionID;
  attendees: AttendeeID[];
  nightShifts: NightShiftID[];
}

interface NightScheduleTableRow {
  date: string;
  position: NightSchedulePosition;
  bunks: Record<number, StaffAttendeeID[]>;
}

function NightScheduleTableContent(props: NightScheduleTableContentProps) {
  const { session, attendees, nightShifts } = props;

  const {
    staffById = {},
    staffByBunk = {},
    bunkNums = [],
  } = useMemo(() => {
    const staff =
      attendees?.filter((att: AttendeeID) => att.role === "STAFF") || [];
    const staffById = getAttendeesById(staff);
    const staffByBunk = groupAttendeesByBunk(staff);
    const bunkNums = Object.keys(staffByBunk)
      .map((bunkNum) => Number(bunkNum))
      .sort((a, b) => a - b);
    return { staffById, staffByBunk, bunkNums };
  }, [attendees]);

  const getStaffForPosition = (
    nightShift: NightShiftID,
    bunkNum: number,
    position: NightSchedulePosition
  ): StaffAttendeeID[] => {
    const bunkData = nightShift[bunkNum];

    const date = nightShift.id;

    switch (position) {
      case "NIGHT-BUNK-DUTY": {
        return bunkData.nightBunkDuty.map((staffId) => staffById[staffId]);
      }
      case "COUNSELOR-ON-DUTY": {
        return bunkData.nightBunkDuty.map((staffId) => staffById[staffId]);
      }
      case "DAY OFF": {
        const staffInBunk: number[] = Array.from(
          staffByBunk[bunkNum].map((att) => att.id) || []
        );
        const staffOff = staffInBunk.filter((staffId: number) => {
          const staff = staffById[staffId];
          return staff.daysOff.includes(date);
        });
        return staffOff.map((staffId: number) => staffById[staffId]);
      }
      case "ROVER": {
        const allStaffInBunk: number[] = Array.from(
          staffByBunk[bunkNum].map((att) => att.id) || []
        );
        const assignedStaff = new Set([
          ...bunkData.nightBunkDuty,
          ...bunkData.counselorsOnDuty,
        ]);

        const roverStaff = allStaffInBunk.filter((staffId: number) => {
          if (assignedStaff.has(staffId)) return false;
          const staff = staffById[staffId];
          if (staff.daysOff.includes(date)) return false;
          return true;
        });

        return roverStaff.map((staffId: number) => staffById[staffId]);
      }
      default:
        return [];
    }
  };

  const data: NightScheduleTableRow[] = useMemo(() => {
    const rows: NightScheduleTableRow[] = [];
    nightShifts.forEach((nightShift: NightShiftID, dayIndex: number) => {
      nightSchedulePositions.forEach((position: NightSchedulePosition) => {
        const row: NightScheduleTableRow = {
          date: nightShift.id,
          position: position,
          bunks: bunkNums.map((bunkNum) =>
            getStaffForPosition(nightShift, bunkNum, position)
          ),
        };
        rows.push(row);
      });
    });
    return rows;
  }, [nightShifts, bunkNums]);

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
            <Text className="text-xs font-semibold text-[#868e96]">
              {moment(row.original.date).format("MMM D, YYYY")}
            </Text>
          </div>
        ),
      },
      {
        accessorFn: (row) => getNightSchedulePositionAbbreviation(row.position),
        header: "POSITION",
        size: 100,
      },
    ];

    bunkNums.forEach((bunkNum: number) => {
      cols.push({
        accessorFn: (row: NightScheduleTableRow) =>
          row.bunks[bunkNum] &&
          row.bunks[bunkNum].map((staff) => getFullName(staff)).join(", "),
        header: `BUNK ${bunkNum}`,
      });
    });

    return cols;
  }, [bunkNums]);

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
                  header.getContext()
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
                      rowSpan={nightSchedulePositions.length}
                      className="text-center align-middle font-semibold bg-gray-200 border border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                        cell.getContext()
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
