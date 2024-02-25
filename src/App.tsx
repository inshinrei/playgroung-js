import React from 'react'

import styles from './App.module.scss'
import { ProjectNier } from './projects/nier/nier'
import { Sb } from './projects/sb'

function App() {
  return (
    <div className={styles.root}>
      <Sb />
    </div>
  )
}

export default App
