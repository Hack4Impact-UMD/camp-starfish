'use client';
export const StaffCell = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs">
      i
    </div>
    <span className="font-medium">{name}</span>
  </div>
);
