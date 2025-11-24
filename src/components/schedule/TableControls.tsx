'use client';
import { RotateCcw, RefreshCw, Save, Search } from 'lucide-react';
import { ViewMode } from './utils/types';

export const TableControls = ({
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  onReset
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center gap-4">
      <select 
        className="border border-gray-300 rounded px-4 py-2 bg-white"
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
      >
        <option value="staff">Schedule View: Camper</option>
        <option value="freeplay">Schedule View: Staff</option>
      </select>
      
      <select className="border border-gray-300 rounded px-4 py-2 bg-white">
        <option>Sort by: None</option>
      </select>
      
      <div className="text-sm text-gray-600">0 filters applied</div>
      
      <div className="flex-1 flex items-center gap-2 max-w-md">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search Staff..."
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
          <RotateCcw size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
          <RefreshCw size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
          <Save size={18} />
        </button>
      </div>
      
      <button 
        onClick={onReset}
        className="px-4 py-2 hover:bg-gray-100 rounded border border-gray-300 font-semibold"
      >
        RESET
      </button>
    </div>
  );
};