import React from 'react'
import styles from './Marquee.module.css'

type Props = {
  entries: Array<string>
}

function Marquee({ entries }: Props) {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {entries.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default Marquee
