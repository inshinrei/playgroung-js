import React from 'react'

import styles from './Options.module.scss'

import type { NetworkOptions } from '../../utils/types'

type Props = {
  options: NetworkOptions
  onChange: (options: NetworkOptions) => void
}

function Options({ options, onChange }: Props) {
  function onAvgLatencyChange(event: { target: { value: string } }) {
    onChange({
      ...options,
      avgLatency: parseInt(event.target.value, 10),
    })
  }

  function onLossRateChange(event: { target: { value: string } }) {
    onChange({
      ...options,
      lossRate: parseInt(event.target.value, 10),
    })
  }

  return (
    <div>
      <h2>Options</h2>
      <div className={styles.optionsList}>
        <label>
          <span className={styles.labelText}>{`Avg Latency (ms): `}</span>
          <input readOnly value={options.avgLatency} />

          <span>{`0 `}</span>
          <input
            type="range"
            min={0}
            max={10000}
            value={options.avgLatency}
            onChange={onAvgLatencyChange}
          />
          <span>10sec</span>
        </label>

        <label>
          <span className={styles.labelText}>{`Loss rate (%): `}</span>
          <input readOnly value={options.lossRate} />

          <span>{`0 `}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={options.lossRate}
            onChange={onLossRateChange}
          />
          <span>100%</span>
        </label>
      </div>
    </div>
  )
}

export default Options
