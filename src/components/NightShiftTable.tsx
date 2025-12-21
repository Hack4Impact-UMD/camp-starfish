import { useMemo } from "react";
import { Box, Container, Flex, Table } from "@mantine/core";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { NightShiftID, AttendeeID } from "@/types/sessionTypes";
import { getFullName } from "@/utils/personUtils";

import moment from "moment";
import useAttendeesBySessionId from "@/hooks/attendees/useAttendeesBySessionId";
import useNightShiftsBySessionId from "@/hooks/nightShifts/useNightShiftsBySessionId";
import {
  getAttendeesById,
  groupAttendeesByBunk,
} from "@/features/scheduling/generation/schedulingUtils";
import LoadingPage from "@/app/loading";

interface NightScheduleTableProps {
  sessionId: string;
}

type Position = "NBD1" | "NBD2" | "COD1" | "COD2" | "ROVER" | "DAY OFF";

interface TableRow {
  day: string;
  dayNumber: number;
  date: string;
  position: Position;
  [key: string]: string | number;
}

export default function NightScheduleTable(props: NightScheduleTableProps) {
  const { sessionId } = props;

  const { data: attendees, status: attendeesStatus } =
    useAttendeesBySessionId(sessionId);
  const { data: nightShifts, status: nightShiftsStatus } =
    useNightShiftsBySessionId(sessionId);

  const { staff, staffById, staffByBunk, bunkNums } = useMemo(() => {
    const staff = attendees?.filter((att: AttendeeID) => att.role === "STAFF") || [];
    const staffById = getAttendeesById(staff);
    const staffByBunk = groupAttendeesByBunk(staff);
    const bunkNums = Object.keys(staffByBunk).map(bunkNum => Number(bunkNum)).sort((a, b) => a - b);
    return { staff, staffById, staffByBunk, bunkNums};
  }, [attendees]);

  if (attendeesStatus === "pending" || nightShiftsStatus === "pending")
    return <LoadingPage />;
  if (attendeesStatus === "error" || nightShiftsStatus === "error")
    return <p>Error loading data</p>;

  const formatDate = (isoDate: string) => {
    const date = moment(isoDate);
    const formatted = date.format("MMM D, YYYY");
    return formatted;
  };

  const getStaffName = (staffId: number): string => {
    const staff = staffById[staffId];
    if (!staff) return `Unknown (${staffId})`;

    return getFullName(staff);
  };

  const getStaffForPosition = (
    nightShift: NightShiftID,
    bunkNum: number,
    position: Position
  ): string => {
    const bunkData = nightShift[bunkNum];
    if (!bunkData) return "-";

    const date = nightShift.id;

    switch (position) {
      case "NBD1": {
        const staffIds = bunkData["NIGHT-BUNK-DUTY"];
        return staffIds[0] ? getStaffName(staffIds[0]) : "-";
      }
      case "NBD2": {
        const staffIds = bunkData["NIGHT-BUNK-DUTY"];
        return staffIds[1] ? getStaffName(staffIds[1]) : "-";
      }
      case "COD1": {
        const staffIds = bunkData["COUNSELOR-ON-DUTY"];
        return staffIds[0] ? getStaffName(staffIds[0]) : "-";
      }
      case "COD2": {
        const staffIds = bunkData["COUNSELOR-ON-DUTY"];
        return staffIds[1] ? getStaffName(staffIds[1]) : "-";
      }
      case "DAY OFF": {
        const staffInBunk: number[] = Array.from(
          staffByBunk[bunkNum].map((att) => att.id) || []
        );
        const staffOff = staffInBunk.filter((staffId: number) => {
          const staff = attendees[staffId];
          return staff?.daysOff.includes(date);
        });
        return staffOff.map((id: number) => getStaffName(id)).join(", ") || "-";
      }
      case "ROVER": {
        const allStaffInBunk: number[] = Array.from(
          staffByBunk[bunkNum].map((att) => att.id) || []
        );
        const assignedStaff = new Set([
          ...bunkData["NIGHT-BUNK-DUTY"],
          ...bunkData["COUNSELOR-ON-DUTY"],
        ]);

        const roverStaff = allStaffInBunk.filter((staffId: number) => {
          if (assignedStaff.has(staffId)) return false;
          const staff = attendees[staffId];
          if (staff?.daysOff.includes(date)) return false;
          return true;
        });

        return (
          roverStaff.map((id: number) => getStaffName(id)).join(", ") || "-"
        );
      }
      default:
        return "-";
    }
  };

  const positions: Position[] = [
    "NBD1",
    "NBD2",
    "COD1",
    "COD2",
    "ROVER",
    "DAY OFF",
  ];

  const data: TableRow[] = useMemo(() => {
    const rows: TableRow[] = [];

    nightShifts.forEach((nightShift: NightShiftID, dayIndex: number) => {
      positions.forEach((position: Position) => {
        const row: TableRow = {
          day: `Day ${dayIndex + 1}`,
          dayNumber: dayIndex + 1,
          date: formatDate(nightShift.id),
          position: position,
        };

        bunkNums.forEach((bunkNum: number) => {
          const staffValue = getStaffForPosition(nightShift, bunkNum, position);
          row[`bunk${bunkNum}`] = staffValue;
        });

        rows.push(row);
      });
    });

    return rows;
  }, [nightShifts, bunkNums]);

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    const cols: ColumnDef<TableRow>[] = [
      {
        accessorKey: "day",
        header: "DAY",
        size: 120,
        cell: ({ row }) => (
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {row.original.day}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#868e96" }}>
              {row.original.date}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "position",
        header: "POSITION",
        size: 100,
      },
    ];

    bunkNums.forEach((bunkNum: number) => {
      cols.push({
        accessorKey: `bunk${bunkNum}`,
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
    <Container>
      <Flex direction={"column"}>
        <Box>
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                const isFirstPositionInDay = row.original.position === "NBD1";

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
                            rowSpan={positions.length}
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
      </Flex>
    </Container>
  );
}
