export enum LoadMoreDirection {
  Backwards,
  Forwards,
  Around,
}

export type AnyToVoidFunction = (...args: any[]) => void
export type NoneToVoidFunction = () => void
export type AnyFunction = (...args: any[]) => any
