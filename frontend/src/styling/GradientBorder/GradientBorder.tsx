import React from 'react'
import styles from './GradientBorder.module.css'

function GradientBorder() {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        <li className={styles.item} />
        <li className={styles.item} />
        <li className={styles.item} />
        <li className={styles.item} />
        <li className={styles.item} />
        <li className={styles.item} />
      </ul>
    </div>
  )
}

export default GradientBorder
