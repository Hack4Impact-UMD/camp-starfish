// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type NestedFieldPath<T, Prefix extends string = ""> =
  T extends object
  ? {
    [K in keyof T & string]:
    | `${Prefix}${K}`
    | NestedFieldPath<T[K], `${Prefix}${K}.`>;
  }[keyof T & string]
  : never;