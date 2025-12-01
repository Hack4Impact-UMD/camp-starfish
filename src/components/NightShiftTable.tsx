import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Flex, Table } from '@mantine/core';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { StaffAttendeeID, NightShiftID, AttendeeID } from '@/types/sessionTypes';
import { getFullName } from '@/utils/personUtils'; // ADDED: Import name utility
import useNightScheduleData from './useNightShiftTable';

import moment from 'moment';

interface NightScheduleTableProps {
  sessionId: string;
}

type Position = 'NBD1' | 'NBD2' | 'COD1' | 'COD2' | 'ROVER' | 'DAY OFF';

interface TableRow {
  day: string;
  dayNumber: number;
  date: string;
  position: Position;
  [key: string]: string | number; // Dynamic bunk columns
}

export default function NightScheduleTable(props: NightScheduleTableProps) {
  const { sessionId } = props;

  const { nightShifts, attendeeList, isLoading, error } = useNightScheduleData(sessionId);

  // Debug logging
  useEffect(() => {
    console.log('=== DEBUGGING DATA ===');
    console.log('nightShifts:', nightShifts);
    console.log('attendeeList:', attendeeList);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
  }, [nightShifts, attendeeList, isLoading, error]);

  // Filter to only staff attendees
  const staffAttendees: StaffAttendeeID[] = useMemo(() => {
    if (!attendeeList) return [];
    const filtered = attendeeList.filter((att: AttendeeID) => att.role === "STAFF") as StaffAttendeeID[];
    console.log('staffAttendees:', filtered);
    return filtered;
  }, [attendeeList]);

  const [attendeeMap, setAttendeeMap] = useState<Map<number, StaffAttendeeID>>(
    new Map()
  );
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (staffAttendees && staffAttendees.length > 0) {
      const map = new Map<number, StaffAttendeeID>();
      staffAttendees.forEach((attendee: StaffAttendeeID) => {
        map.set(attendee.id, attendee);
      });
      setAttendeeMap(map);
      setIsMapReady(true);
      console.log('attendeeMap created:', map);
    }
  }, [staffAttendees]);

  // Get staff by bunk for rover calculation
  const staffByBunk = useMemo(() => {
    if (!staffAttendees) return new Map();
    const map = new Map<number, Set<number>>();
    staffAttendees.forEach((att: StaffAttendeeID) => {
      if (!map.has(att.bunk)) {
        map.set(att.bunk, new Set());
      }
      map.get(att.bunk)!.add(att.id);
    });
    return map;
  }, [staffAttendees]);

  // Get all unique bunk numbers sorted
  const bunkNumbers = useMemo(() => {
    if (!staffAttendees) return [];
    const bunks = new Set<number>();
    staffAttendees.forEach((att: StaffAttendeeID) => {
      bunks.add(att.bunk);
    });
    return Array.from(bunks).sort((a, b) => a - b);
  }, [staffAttendees]);

  // Format date for display
  const formatDate = (isoDate: string) => {
    console.log('formatDate input:', isoDate);
    // UPDATED: Use moment library for formatting
    const date = moment(isoDate); 
    console.log('parsed date:', date.format());
    const formatted = date.format('MMM D, YYYY');
    console.log('formatted date:', formatted);
    return formatted;
  };

  // Get staff name by ID
  const getStaffName = (staffId: number): string => {
    const staff = attendeeMap.get(staffId);
    if (!staff) return `Unknown (${staffId})`;

    return getFullName(staff); 
  };

  // Get staff for a specific position in a bunk on a date
  const getStaffForPosition = (
    nightShift: NightShiftID,
    bunkNum: number,
    position: Position
  ): string => {
    const bunkData = nightShift[bunkNum];
    if (!bunkData) return '-';

    const date = nightShift.id;

    switch (position) {
      case 'NBD1': {
        const staffIds = bunkData.nightBunkDuty;
        if (staffIds.length > 1) {
          console.warn(
            `Multiple NBD1 staff for bunk ${bunkNum} on ${date}:`,
            staffIds
          );
        }
        return staffIds[0] ? getStaffName(staffIds[0]) : '-';
      }
      case 'NBD2': {
        const staffIds = bunkData.nightBunkDuty;
        if (staffIds.length > 2) {
          console.warn(
            `More than 2 NBD staff for bunk ${bunkNum} on ${date}:`,
            staffIds
          );
        }
        return staffIds[1] ? getStaffName(staffIds[1]) : '-';
      }
      case 'COD1': {
        const staffIds = bunkData.counselorsOnDuty;
        if (staffIds.length > 1) {
          console.warn(
            `Multiple COD1 staff for bunk ${bunkNum} on ${date}:`,
            staffIds
          );
        }
        return staffIds[0] ? getStaffName(staffIds[0]) : '-';
      }
      case 'COD2': {
        const staffIds = bunkData.counselorsOnDuty;
        if (staffIds.length > 2) {
          console.warn(
            `More than 2 COD staff for bunk ${bunkNum} on ${date}:`,
            staffIds
          );
        }
        return staffIds[1] ? getStaffName(staffIds[1]) : '-';
      }
      case 'DAY OFF': {
        // Find staff in this bunk who have this date off
        const staffInBunk: number[] = Array.from(staffByBunk.get(bunkNum) || []);
        const staffOff = staffInBunk.filter((staffId: number) => {
          const staff = attendeeMap.get(staffId);
          return staff?.daysOff.includes(date);
        });
        return staffOff.map((id: number) => getStaffName(id)).join(', ') || '-';
      }
      case 'ROVER': {
        // Get all staff in bunk, exclude NBD, COD, and Day Off
        const allStaffInBunk: number[] = Array.from(staffByBunk.get(bunkNum) || []);
        const assignedStaff = new Set([
          ...bunkData.nightBunkDuty,
          ...bunkData.counselorsOnDuty,
        ]);

        const roverStaff = allStaffInBunk.filter((staffId: number) => {
          if (assignedStaff.has(staffId)) return false;
          const staff = attendeeMap.get(staffId);
          if (staff?.daysOff.includes(date)) return false;
          return true;
        });

        return roverStaff.map((id: number) => getStaffName(id)).join(', ') || '-';
      }
      default:
        return '-';
    }
  };

  const positions: Position[] = [
    'NBD1',
    'NBD2',
    'COD1',
    'COD2',
    'ROVER',
    'DAY OFF',
  ];

  // Build table data
  const data: TableRow[] = useMemo(() => {
    if (!isMapReady || !nightShifts) {
      console.log('Data building skipped - isMapReady:', isMapReady, 'nightShifts:', nightShifts);
      return [];
    }

    console.log('Building table data...');
    console.log('nightShifts structure:', nightShifts);
    console.log('bunkNumbers:', bunkNumbers);

    const rows: TableRow[] = [];

    nightShifts.forEach((nightShift: NightShiftID, dayIndex: number) => {
      console.log(`Processing nightShift for day ${dayIndex + 1}:`, nightShift);
      
      positions.forEach((position: Position) => {
        const row: TableRow = {
          day: `Day ${dayIndex + 1}`,
          dayNumber: dayIndex + 1,
          date: formatDate(nightShift.id),
          position: position,
        };

        // Add columns for each bunk
        bunkNumbers.forEach((bunkNum: number) => {
          const staffValue = getStaffForPosition(nightShift, bunkNum, position);
          row[`bunk${bunkNum}`] = staffValue;
          if (dayIndex === 0 && position === 'NBD1') {
            console.log(`Bunk ${bunkNum}, ${position}:`, staffValue);
          }
        });

        rows.push(row);
      });
    });

    console.log('Final table rows:', rows);
    return rows;
  }, [nightShifts, isMapReady, bunkNumbers]);

  // Define columns dynamically based on bunks
  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    const cols: ColumnDef<TableRow>[] = [
      {
        accessorKey: 'day',
        header: 'DAY',
        size: 120,
        cell: ({ row }) => (
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {row.original.day}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
              {row.original.date}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'position',
        header: 'POSITION',
        size: 100,
      },
    ];

    // Add columns for each bunk
    bunkNumbers.forEach((bunkNum: number) => {
      cols.push({
        accessorKey: `bunk${bunkNum}`,
        header: `BUNK ${bunkNum}`,
      });
    });

    return cols;
  }, [bunkNumbers]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Container>
      {/* UPDATED: Loading check uses !isMapReady */}
      {(isLoading || !isMapReady) && <>Loading Table</>}
      <Flex direction={'column'}>
        <Box>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            // REPLACED: style={{ borderCollapse: 'collapse' }}
            className="border-collapse" 
          >
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th
                      key={header.id}
                      // ALREADY TAILWIND
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
                const isFirstPositionInDay = row.original.position === 'NBD1';
                
                return (
                  <Table.Tr key={row.id}>
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      // Handle the DAY column with rowSpan
                      if (cellIndex === 0) {
                        if (!isFirstPositionInDay) {
                          return null; // Skip rendering for non-first positions
                        }
                        return (
                          <Table.Td
                            key={cell.id}
                            rowSpan={positions.length}
                            // REPLACED INLINE STYLE WITH TAILWIND
                            className="text-center align-middle font-semibold bg-gray-200 border border-gray-300"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Table.Td>
                        );
                      }
                      
                      // Handle POSITION column
                      if (cellIndex === 1) {
                        return (
                          <Table.Td
                            key={cell.id}
                            // REPLACED INLINE STYLE WITH TAILWIND
                            className="text-center font-medium border border-gray-300"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Table.Td>
                        );
                      }
                      
                      // Handle bunk columns
                      return (
                        <Table.Td
                          key={cell.id}
                          // REPLACED INLINE STYLE WITH TAILWIND
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