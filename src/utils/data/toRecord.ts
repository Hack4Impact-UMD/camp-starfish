export function toRecord<TData, IDType extends string | number | symbol>(data: TData[], idFunc: (item: TData) => IDType): Record<IDType, TData> {
  const record: Record<IDType, TData> = {} as Record<IDType, TData>;
  data.forEach((item: TData) => record[idFunc(item)] = item);
  return record;
}