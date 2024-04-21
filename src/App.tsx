import React from 'react'

import styles from './App.module.scss'
import { DsEvents } from './projects/dsevents'

function App() {
  return (
    <div className={styles.root}>
      <DsEvents />
    </div>
  )
}

export default App
