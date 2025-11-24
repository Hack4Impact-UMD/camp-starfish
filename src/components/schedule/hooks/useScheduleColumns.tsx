'use client';
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { StaffCell } from '../StaffCell';
import { HealthCell } from '../HealthCell';
import { FreeplayCell } from '../FreeplayCell';
import { ScheduleEntry, ViewMode } from '../utils/types';

export const useScheduleColumns = (viewMode: ViewMode) => {
    const helper = createColumnHelper<ScheduleEntry>();

    const staffColumns = useMemo(() => [
        helper.accessor('name', {
            header: 'NAME',
            cell: (info) => <StaffCell name={ info.getValue() } />,
      }),
    helper.accessor('blockA', { header: 'BLOCK A' }),
        helper.accessor('blockB', { header: 'BLOCK B' }),
        helper.accessor('blockC', { header: 'BLOCK C' }),
        helper.accessor('blockD', { header: 'BLOCK D' }),
        helper.accessor('blockE', { header: 'BLOCK E' }),
        helper.accessor('health', {
            header: 'HEALTH',
            cell: (info) => <HealthCell condition={ info.getValue() } />,
      }),
        helper.accessor('amPmFreeplay', {
            header: 'AM/PM FREEPLAY',
            cell: (info) => <FreeplayCell value={ info.getValue() } />,
      }),
  ], [helper]);

const freeplayColumns = useMemo(() => [
    helper.accessor('name', {
        header: 'NAME',
        cell: (info) => <div className="font-medium"> { info.getValue() } </div>,
    }),
    helper.accessor('blockA', { header: 'BLOCK A' }),
    helper.accessor('blockB', { header: 'BLOCK B' }),
    helper.accessor('blockC', { header: 'BLOCK C' }),
    helper.accessor('blockD', { header: 'BLOCK D' }),
    helper.accessor('blockE', { header: 'BLOCK E' }),
    helper.accessor('apo', { header: 'APO' }),
    helper.accessor('freeplayAssignment', {
        header: 'FREEPLAY ASSIGNMENT',
        cell: (info) => <FreeplayCell value={ info.getValue() } />,
    }),
] , [helper]);

return viewMode === 'staff' ? staffColumns : freeplayColumns;
  };