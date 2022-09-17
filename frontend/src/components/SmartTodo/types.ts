export enum TodoItemCategory {
  Grocery = 'Grocery',
  Task = 'Task',
  Reminder = 'Reminder',
}

export enum MovementStatus {
  Entering = 'Entering',
  Leaving = 'Leaving',
}

export interface ICategorySelection {
  current: TodoItemCategory | null
  previous: TodoItemCategory | null
}

export interface IPosition {
  left: number
  top: number
}

export interface INumberUtility {
  clamp: (min: number, value: number, max: number) => number
  rand: (min: number, max: number) => number
}

export interface IPositionUtility {
  calculate: (
    center: IPosition,
    radius: number,
    count: number,
    size: number,
    index: number
  ) => IPosition
}

export interface ITodoItem {
  category: TodoItemCategory
  id: string
  description: string
  image: string
  quantity?: number
  zone: number
}

export interface ITodoUtility {
  applyZones: (items: ITodoItem[]) => ITodoItem[]
  determineFinalPosition: (count: number, size: number, index: number) => IPosition
  determineTargetPosition: (id: string) => IPosition
  getBaseSize: () => number
  getIcon: (category: TodoItemCategory) => string
  list: () => ITodoItem[]
  shuffle: (items: ITodoItem[]) => ITodoItem[]
  sumSize: (items: ITodoItem[], size: number) => number
}
