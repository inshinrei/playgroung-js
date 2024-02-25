import React from 'react'

import styles from './sb.module.scss'
import cn from 'classnames'

interface BarProps {
  className?: string
}

function Bar({ className }: BarProps) {
  return (
    <div className={cn(styles.barContainer, className)}>
      <div className={styles.bar} />
      <div className={styles.thumb} />
    </div>
  )
}

export function Sb() {
  return (
    <div className={styles.root}>
      <div className={styles.verticalContainer}>
        <Bar className={styles.vertical} />
        <Bar className={styles.vertical} />
        <Bar className={styles.vertical} />
        <Bar className={styles.vertical} />
      </div>

      <div className={styles.horizontalContainer}>
        <Bar className={styles.horizontal} />
        <Bar className={styles.horizontal} />
      </div>
    </div>
  )
}
