'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  totalEntries,
  itemsPerPage,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 bg-gray-200 rounded font-semibold">
          {currentPage}
        </button>
      </div>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight size={18} />
      </button>
      
      <div className="text-sm text-gray-600">
      {totalEntries === 0 
        ? 'No entries to display'
        : `Showing ${(currentPage - 1) * itemsPerPage + 1} out of ${totalEntries} entries`}
      </div>
    </div>
  );
};