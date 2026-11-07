// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]
export type Nullable<T> = { [K in keyof T]: T[K] | null; };
export type StrictExtract<T, U extends T> = Extract<T, Partial<U>>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type IsIndexKey<P extends PropertyKey> = {} extends Record<P, unknown> ? true : false;
type LeafPaths<Path extends string> = Exclude<Path, `${string}.${string}`>;
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

type TypedObjectKeys<T extends object> = (keyof T)[];
export function objectKeys<T extends object>(obj: T): TypedObjectKeys<T> {
  return Object.keys(obj) as TypedObjectKeys<T>;
}

export function objectValues<T extends object>(obj: T): (T[keyof T])[] {
  return Object.values(obj);
}

type TypedObjectEntries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
export function objectEntries<T extends object>(obj: T): TypedObjectEntries<T> {
  return Object.entries(obj) as TypedObjectEntries<T>;
}