export default function partition<T>(items: T[], partitionFunc: (item: T) => boolean): { trueGroup: T[], falseGroup: T[] } {
  const trueGroup: T[] = [];
  const falseGroup: T[] = [];
  items.forEach((item: T) => (partitionFunc(item) ? trueGroup.push(item) : falseGroup.push(item)))
  return { trueGroup, falseGroup };
}