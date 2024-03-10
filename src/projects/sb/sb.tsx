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
    let timeout: number
    let e = ref.current
    if (e && e.parentElement) {
      timeout = setTimeout(
        () => {
          moveElement()
        },
        Math.random() * 4000 + 2000,
      )
    }
    return () => clearInterval(timeout)
  }, [ref.current])

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('transitionend', moveElement)
    }
    return () => ref.current?.removeEventListener('transitionend', moveElement)
  }, [ref.current])

  function moveElement() {
    let e = ref.current
    if (e && e.parentElement) {
      e.style.transform = `translateY(${
        Math.floor(Math.random() * e.parentElement.clientHeight - 93) || 0
      }px)`
    }
  }

  return (
    <div className={cn(styles.barContainer, className)}>
      <div className={styles.bar} />
      <div className={styles.thumb} ref={ref} />
    </div>
  )
}
