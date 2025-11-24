'use client';
export const FreeplayCell = ({ value }: { value?: string }) => {
  if (!value) return null;

  if (value === 'Explorer' || value === 'Fort Starfish') {
    return <span>{value}</span>;
  }

  const names = value.split(', ');

  return (
    <div className="flex items-center gap-2">
      {names.map((name, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs">
            i
          </div>
          <span className="text-sm">{name}</span>
        </div>
      ))}
    </div>
  );
};
