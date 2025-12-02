'use client';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useScheduleColumns } from './hooks/useScheduleColumns';
import { ScheduleEntry, ViewMode } from './utils/types';

export const ScheduleTable = ({
  data,
  viewMode,
}: {
  data: ScheduleEntry[];
  viewMode: ViewMode;
}) => {
  const columns = useScheduleColumns(viewMode);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((h) => (
            <tr key={h.id}>
              {h.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
