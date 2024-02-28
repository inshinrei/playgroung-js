import React, { useEffect, useRef } from 'react'

import styles from './sb.module.scss'
import cn from 'classnames'

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

interface BarProps {
  className?: string
}

function Bar({ className }: BarProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let interval: number
    let e = ref.current
    if (e) {
      interval = setInterval(() => {
        e!.style.transform = `translateY(${Math.random() * 100}px)`
      }, 700)
    }
    return () => clearInterval(interval)
  }, [ref.current])

  return (
    <div className={cn(styles.barContainer, className)}>
      <div className={styles.bar} />
      <div className={styles.thumb} ref={ref} />
    </div>
  )
}
