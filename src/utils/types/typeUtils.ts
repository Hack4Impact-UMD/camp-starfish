// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]
export type Nullable<T> = { [K in keyof T]: T[K] | null; };
export type StrictExtract<T, U extends T> = Extract<T, Partial<U>>;

export type NestedOmit<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? T extends Array<infer Item>
    ? Array<NestedOmit<Item, Path>>
    : T extends object
    ? {
        [P in keyof T]: Key extends '__dynamic__'
          ? (string extends P ? NestedOmit<T[P], Rest> : T[P])
          : P extends Key
          ? NestedOmit<T[P], Rest>
          : T[P];
      }
    : T
  : Path extends string
  ? T extends Array<infer Item>
    ? Array<NestedOmit<Item, Path>>
    : T extends object
    ? {
        [P in keyof T as Path extends '__dynamic__'
          ? (string extends P ? never : P)
          : P extends Path 
          ? never 
          : P]: T[P];
      }
    : T
  : T;

export function nestedOmit<T, Path extends string>(obj: T, path: Path): NestedOmit<T, Path> {
  if (typeof obj !== "object" || obj === null) {
    return obj as NestedOmit<T, Path>;
  } else if (Array.isArray(obj)) {
    return obj.map(item => nestedOmit(item, path)) as NestedOmit<T, Path>;
  }

  const pathSegments = path.split('.');
  const currSegment = pathSegments[0];
  const remainingSegments = pathSegments.slice(1);
  if (remainingSegments.length !== 0) {
    if (currSegment !== '__dynamic__') {
      if (!(currSegment in obj)) {
        return obj as NestedOmit<T, Path>;
      }
      // @ts-expect-error - TypeScript shortcoming
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => key === currSegment ? [key, nestedOmit(obj[key], remainingSegments.join('.'))] : [key, value])) as NestedOmit<T, Path>
    }

    const newObj: object = {};
    for (const [key, value] of Object.entries(obj)) {
      // @ts-expect-error - TypeScript shortcoming
      newObj[key] = nestedOmit(value, remainingSegments.join('.')) as NestedOmit<T, Path>
    }
    return newObj as NestedOmit<T, Path>;
  }

  if (currSegment !== "__dynamic__") {
    if (!(currSegment in obj)) {
      return obj as NestedOmit<T, Path>;
    }
    return Object.fromEntries(Object.entries(obj).filter(([key, _value]) => key !== currSegment)) as NestedOmit<T, Path>;
  }
  return {} as NestedOmit<T, Path>;
}