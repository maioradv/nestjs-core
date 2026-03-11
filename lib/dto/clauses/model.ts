//export type WhereClause = number | number[] | string | string[] | Date | boolean;

export interface DefaultClausesI {
  id?:number[];
  createdAt?:Date;
  updatedAt?:Date;
  minCreatedAt?:Date;
  maxCreatedAt?:Date;
  minUpdatedAt?:Date;
  maxUpdatedAt?:Date;
  metafields?:Record<string,string>[],
  translations?:Record<string,string>[],
}

export type WhereClausesOf<T, P extends keyof T = Exclude<keyof T,keyof DefaultClausesI>> = {
  [K in P]?: T[K] | T[K][]
}