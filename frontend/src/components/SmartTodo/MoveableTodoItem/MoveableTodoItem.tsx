import React, { useContext, useEffect, useState } from 'react'
import styles from './MoveableTodoItem.module.scss'

import { IPosition, MovementStatus } from '../types'
import { SmartTodoContext } from '../context'
import { clearTimeout } from 'timers'

interface Props {
  children: React.ReactNode
  duration: number
  final: IPosition
  status: MovementStatus
  initial: {
    left: number
    top: number
  }
}

interface State {
  position: IPosition
  visible: boolean
}

function MoveableTodoItem(props: Props) {
  const { state: todoState } = useContext(SmartTodoContext) ?? {}

  const [state, setState] = useState<State>({
    position: props.initial,
    visible: true,
  })

  function setVisibleTo(visible: boolean): void {
    setState({ ...state, visible })
  }

  function setPositionTo(position: IPosition): void {
    setState({ ...state, position })
  }

  useEffect(() => {
    setState({ position: props.initial, visible: true })

    const timeout: NodeJS.Timeout = setTimeout(() => {
      setPositionTo(props.final)
    }, 1)

    return () => {
      clearTimeout(timeout)
    }
  }, [props.final])

  useEffect(() => {
    if (props.status === MovementStatus.Leaving) {
      const timeout: NodeJS.Timeout = setTimeout(() => {
        setVisibleTo(false)
      }, props.duration)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [props.final])

  function getStyles(): React.CSSProperties {
    const styles: React.CSSProperties = {
      left: `${state.position.left}px`,
      top: `${state.position.top}px`,
      transition: `left ${props.duration}ms, opacity ${props.duration}ms, top ${props.duration}ms`,
    }

    if (todoState?.category.current !== null && props.status === MovementStatus.Leaving) {
      styles.opacity = '0.5'
    }

    return styles
  }

  if (!state.visible) {
    return null
  }

  return (
    <div className={styles.root} style={getStyles()}>
      {props.children}
    </div>
  )
}

export default MoveableTodoItem
