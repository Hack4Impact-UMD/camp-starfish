import { UUIDV4, uuidv4 } from "@/types/utils/idTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]
export type Nullable<T> = { [K in keyof T]: T[K] | null; };
export type StrictExtract<T, U extends T> = Extract<T, Partial<U>>;

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

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

export function objectValues<T extends object>(obj: T): (T[keyof T])[] {
  return Object.values(obj);
}

export function objectEntries<T extends object>(obj: T): { [K in keyof T]: [K, T[K]] }[keyof T][] {
  return Object.values(obj);
}