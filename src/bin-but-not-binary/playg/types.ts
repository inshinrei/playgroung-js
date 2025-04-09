export enum LoadMoreDirection {
  Backwards,
  Forwards,
  Around,
}

export type AnyToVoidFunction = (...args: any[]) => void
export type NoneToVoidFunction = () => void
export type AnyFunction = (...args: any[]) => any

export type GetMore = (args: { direction: LoadMoreDirection }) => void
export type LoadMoreBackwards = (args: { offsetId?: number | string }) => void
