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
        [P in keyof T]: string extends P 
          ? NestedOmit<T[P], Rest> // Handle dynamic string keys [key: string]
          : number extends P
          ? NestedOmit<T[P], Rest> // Handle dynamic number keys [key: number]
          : P extends Key
          ? NestedOmit<T[P], Rest> // Handle explicit static keys
          : T[P];
      }
    : T
  : Path extends string
  ? T extends Array<infer Item>
    ? Array<NestedOmit<Item, Path>>
    : T extends object
    ? {
        // Map keys, discarding the exact dynamic or static key matching the end of the path
        [P in keyof T as P extends Path 
          ? never 
          : string extends Path 
          ? (string extends P ? never : P) 
          : number extends Path 
          ? (number extends P ? never : P) 
          : P]: T[P];
      }
    : T
  : T;