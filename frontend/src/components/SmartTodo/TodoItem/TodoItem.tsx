import React, { useContext } from 'react'

import { IPosition, ITodoItem, TodoItemCategory } from '../types'
import { SmartTodoContext } from '../context'

interface Props {
  item: ITodoItem
  position?: IPosition
  unit?: '%' | 'px'
}

function TodoItem(props: Props) {
  const { state, selectCategory } = useContext(SmartTodoContext) ?? {}
  const { item, position } = props

  const size = (state?.size ?? 1) * ((item as any).size ?? 1)

  function getTooltip(): JSX.Element {
    function getQuantity(): JSX.Element | null {
      if (item.category === TodoItemCategory.Grocery) {
        return <span className={styles.itemQuantity}>({item.quantity})</span>
      }

      return null
    }

    return (
      <div className={styles.itemTooltip}>
        <p>
          {item.description} {getQuantity()}
        </p>
      </div>
    )
  }
}

export default TodoItem
