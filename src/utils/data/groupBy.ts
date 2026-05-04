export function groupBy<TData, IDType extends string | number | symbol>(data: TData[], groupFunc: (item: TData) => IDType): Record<IDType, TData[]> {
  const groups: Record<IDType, TData[]> = {} as Record<IDType, TData[]>;
  data.forEach((item: TData) => {
    const id = groupFunc(item);
    if (!groups[id]) {
      groups[id] = [];
    }
    groups[id].push(item);
  });
  return groups;
}