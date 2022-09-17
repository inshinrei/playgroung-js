import { ICategorySelection, ITodoItem, TodoItemCategory } from './types'
import { createContext } from 'react'

interface State {
  category: ICategorySelection
  items: ITodoItem[]
  size: number
}

export interface ISmartTodoContext {
  state: State
  selectCategory: (category: TodoItemCategory) => void
}

export const SmartTodoContext = createContext<ISmartTodoContext | null>(null)
