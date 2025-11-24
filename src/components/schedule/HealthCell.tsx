'use client';
export const HealthCell = ({ condition }: { condition?: string }) => {
  if (!condition) return null;

  return (
    <div className="flex items-center gap-1">
      <span>{condition}</span>
      <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
        !
      </span>
    </div>
  );
};
