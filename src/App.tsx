import React from 'react'

import styles from './App.module.scss'
import { ProjectNier } from './projects/nier/nier'

function App() {
  return (
    <div className={styles.root}>
      <ProjectNier />
    </div>
  )
}

export default App
