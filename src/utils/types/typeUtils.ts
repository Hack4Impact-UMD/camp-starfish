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

// True for any index-signature key (string, number, branded string, `${string}-x`, ...)
type IsIndexKey<P extends PropertyKey> = {} extends Record<P, unknown> ? true : false;

// Paths with no dot: keys to omit at the current level
type LeafPaths<Path extends string> = Exclude<Path, `${string}.${string}`>;

// Remaining sub-paths to apply to T[P]
type SubPaths<P extends PropertyKey, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends '__dynamic__'
      ? IsIndexKey<P> extends true ? Rest : never
      : P extends Key ? Rest : never
    : never;

export type DistributiveNestedOmit<T, Path extends string> =
  T extends unknown
    ? T extends readonly (infer Item)[]
      ? DistributiveNestedOmit<Item, Path>[]
      : T extends object
        ? {
            [P in keyof T as P extends LeafPaths<Path>
              ? never
              : '__dynamic__' extends LeafPaths<Path>
                ? IsIndexKey<P> extends true ? never : P
                : P
            ]: [SubPaths<P, Path>] extends [never]
              ? T[P]
              : DistributiveNestedOmit<T[P], SubPaths<P, Path>>;
          }
        : T
    : never;
    
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

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

export function objectValues<T extends object>(obj: T): (T[keyof T])[] {
  return Object.values(obj) as (T[keyof T])[];
}