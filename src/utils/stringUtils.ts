export function toNormalCase(str: string) {
  str = str.trim();
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getObjectKeysAsNumbers(obj: Record<number, unknown>): number[] {
  return Object.keys(obj).map(key => Number(key))
}

export function getObjectEntriesWithNumberKeys<T>(obj: Record<number, T>): [number, T][] {
  return Object.entries(obj).map(([key, value]) => [Number(key), value])
}