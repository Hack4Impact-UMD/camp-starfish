// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]
export type Nullable<T> = { [K in keyof T]: T[K] | null; };
export type StrictExtract<T, U extends T> = Extract<T, U>;

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