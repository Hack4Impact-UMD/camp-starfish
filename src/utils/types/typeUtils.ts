// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type DistributiveKeyof<T> = T extends T ? keyof T : never
export type NonEmptyArray<T> = [T, ...T[]]