export type ExcludeMethods<T> = { [K in keyof T as (T[K] extends Function ? never : K)]: T[K] }
export type WithRelations<T,R extends object> = T & R
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }