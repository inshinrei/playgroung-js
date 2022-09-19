import React from 'react'
import styles from './MorphingButton.module.scss'

interface Props {
  text: string
}

function MorphingButton(props: Props) {
  /* progressive duration */
  return (
    <button className={styles.button} type="button">
      <span className="btn__text">{props.text}</span>

      <svg className="btn__progress" viewBox="0 0 48 48" width="48px" height="48px">
        <circle
          className="btn__progress-track"
          r="20"
          cx="24"
          cy="24"
          fill="none"
          stroke="#c7cad1"
          strokeWidth="8"
        />
        <circle
          className="btn__progress-fill"
          r="20"
          cx="24"
          cy="24"
          fill="none"
          transform="rotate(-90,24,24)"
          stroke="#000000"
          strokeWidth="8"
          strokeDasharray="125.66 125.66"
          strokeDashoffset="125.66"
        />
        <polyline
          className="btn__progress-check"
          points="12,24 20,32 36,16"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="34 34"
          strokeDashoffset="34"
        />
      </svg>
    </button>
  )
}

export default MorphingButton
