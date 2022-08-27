import React, { useEffect } from 'react'

import styles from './LiquidButtons.module.scss'
import { registerEventListeners } from './utils'

function LiquidButtons() {
  useEffect(() => {
    registerEventListeners()
  }, [])

  return (
    <div>
      <label className={styles.radio}>
        <input type="radio" name="r" value="1" checked />

        <svg viewBox="0 0 24 24" filter="url(#goo-light)">
          <circle className={styles.top} cx="12" cy="-12" r="8" />
          <circle className={styles.dot} cx="12" cy="12" r="5" />
          <circle className={styles.drop} cx="12" cy="12" r="2" />
        </svg>
      </label>

      <label className={styles.switch}>
        <input type={styles.checkbox} checked />

        <svg viewBox="0 0 38 24" filter="url(#goo)">
          <circle className={styles.default} cx="12" cy="12" r="8" />
          <circle className={styles.dot} cx="26" cy="12" r="8" />
          <circle className={styles.drop} cx="25" cy="-1" r="2" />
        </svg>
      </label>

      <label className={styles.switch}>
        <input type="checkbox" />

        <svg viewBox="0 0 38 24" filter="url(#goo)">
          <circle className={styles.default} cx="12" cy="12" r="8" />
          <circle className={styles.dot} cx="26" cy="12" r="8" />
        </svg>
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" checked />

        <svg viewBox="0 0 24 24" filter="url(#goo-light)">
          <path className={styles.tick} d="M4.5 10L10.5 16L24.5 1" />
          <circle className={styles.dot} cx="10.5" cy="15.5" r="1.5" />
        </svg>
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" />

        <svg viewBox="0 0 24 24" filter="url(#goo-light)">
          <path className={styles.tick} d="M4.5 10L10.5 16L24.5 1" />
          <circle className={styles.dot} cx="10.5" cy="15.5" r="1.5" />
          <circle className={styles.drop} cx="25" cy="-1" r="2" />
        </svg>
      </label>
    </div>
  )
}

export default LiquidButtons
