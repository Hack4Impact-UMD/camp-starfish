// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]
export type Nullable<T> = { [K in keyof T]: T[K] | null; };
export type StrictExtract<T, U extends T> = Extract<T, Partial<U>>;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Builtin = string | number | boolean | bigint | symbol | null | undefined | Function | Date | RegExp | Error;

type Matches<T, From, Exact extends boolean> =
  Exact extends true
    ? [T] extends [From] ? ([From] extends [T] ? true : false) : false
    : T extends From ? true : false;

export type ReplaceType<T, From, To, Exact extends boolean = false> =
  T extends unknown ? ReplaceOne<T, From, To, Exact> : never;

type ReplaceOne<T, From, To, Exact extends boolean> =
  Matches<T, From, Exact> extends true ? To
  : T extends Builtin ? T
  : T extends Map<infer K, infer V>
    ? Map<ReplaceType<K, From, To, Exact>, ReplaceType<V, From, To, Exact>>
  : T extends Set<infer U> ? Set<ReplaceType<U, From, To, Exact>>
  : T extends Promise<infer U> ? Promise<ReplaceType<U, From, To, Exact>>
  : { [K in keyof T]: ReplaceType<T[K], From, To, Exact> };

export type DYNAMIC = "__dynamic__";

type SplitPath<P extends string> =
  P extends `${infer Head}.${infer Rest}` ? [Head, Rest] : [P, ""];

type KeyMatches<K, Head extends string> =
  Head extends DYNAMIC ? true
  : K extends symbol ? false
  : string extends K ? true
  : number extends K ? (Head extends `${number}` ? true : false)
  : `${K & (string | number)}` extends Head ? true : false;

export type ReplaceAtPath<
  T,
  Path extends string,
  From,
  To,
  Exact extends boolean = false
> = T extends unknown ? ReplaceAtPathOne<T, Path, From, To, Exact> : never;

type ReplaceAtPathOne<
  T,
  Path extends string,
  From,
  To,
  Exact extends boolean
> =
  Path extends "" ? ReplaceType<T, From, To, Exact>
  : T extends Builtin ? T
  : SplitPath<Path> extends [infer Head extends string, infer Rest extends string]
    ? T extends Map<infer K, infer V>
        ? Head extends DYNAMIC ? Map<K, ReplaceAtPath<V, Rest, From, To, Exact>> : T
      : T extends Set<infer U>
        ? Head extends DYNAMIC ? Set<ReplaceAtPath<U, Rest, From, To, Exact>> : T
      : T extends Promise<unknown> ? T
      : {
          [K in keyof T]: KeyMatches<K, Head> extends true
            ? ReplaceAtPath<T[K], Rest, From, To, Exact>
            : T[K];
        }
    : T;