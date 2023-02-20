import React, { useState } from 'react'
import styles from './WeatherSnap.module.scss'

function WeatherSnap() {
  const [temperature] = useState(Math.random() * 100)
  return (
    <span className={styles.forecast}>
      <span className={styles.forecastValue}>{temperature}</span>
      <span className={styles.forecastUnit}>°F</span>
    </span>
  )
}

export default WeatherSnap
