'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BundleHeader = ({ 
  bundleName, 
  date, 
  onPrevious, 
  onNext 
}: { 
  bundleName: string;
  date: string;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  return (
    <div className="bg-blue-100 py-4 px-6 flex items-center justify-between border-b border-gray-200">
      <button 
        onClick={onPrevious}
        className="p-2 hover:bg-blue-200 rounded"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <h2 className="text-xl font-bold">{bundleName}</h2>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <button 
        onClick={onNext}
        className="p-2 hover:bg-blue-200 rounded"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};