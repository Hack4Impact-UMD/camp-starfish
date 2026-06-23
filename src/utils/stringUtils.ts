export function toNormalCase(str: string) {
  str = str.trim();
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getObjectKeysAsNumbers(obj: object): number[] {
  return Object.keys(obj).map(key => Number(key))
}