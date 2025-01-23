export type ExcludeMethods<T> = { [K in keyof T as (T[K] extends Function ? never : K)]: T[K] }
export type WithRelations<T,R extends object> = T & R
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type ExtractProperties<T,H> = {
  [K in keyof T]: T[K] extends H ? K : never;
}[keyof T];
export type FilteredProperties<T,H> = Pick<T, ExtractProperties<T,H>>;
export type ExtractCursors<T> = ExtractProperties<T,string | number | Date>