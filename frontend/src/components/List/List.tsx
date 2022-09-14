import React, { ReactNode } from 'react'
import styles from './List.module.scss'

type Props = {
  className?: string
  children?: ReactNode
}

function List({ className, children }: Props) {
  return <ul className={`${styles.root} ${className}`}>{children}</ul>
}

export default List
