export abstract class BaseEvent<B extends string,E extends string,P extends Record<string,any>> {
  public readonly type: `${B}.${E}`;
  constructor(public readonly payload: P) {}
}

/*export const buildEvents = <B extends string,Map extends Record<string,any>>(base: B,events:(keyof Map)[]): Events<B,Map> => {
  return events.reduce((o,key) => {
    o[key] = {
      name:`${base}.${key as Extract<typeof key, string>}`,
      class: class extends BaseEvent<B,Extract<typeof key, string>, Map[typeof key]> {}
    }
  },{} as any)
}*/

export type Events<
  B extends string,
  H extends Record<string,any>
> = {
  readonly [K in keyof H]: new (payload: H[K]) => BaseEvent<B, Extract<K, string>, H[K]>
};