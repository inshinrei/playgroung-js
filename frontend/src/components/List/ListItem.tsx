import React, { KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react'
import styles from './ListItem.module.scss'

type Props = {
  children?: ReactNode
  className?: string
  onItemClick?: MouseEventHandler
  onKeyDown?: KeyboardEventHandler
}

function ListItem({ children, className, onItemClick, onKeyDown }: Props) {
  return (
    <li className={`${styles.root} ${className}`} onClick={onItemClick} onKeyDown={onKeyDown}>
      {children}
    </li>
  )
}

export default ListItem
