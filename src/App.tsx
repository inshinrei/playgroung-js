import React from 'react'
import Loader from './projects/rct-ui-loader'
import styles from './App.module.scss'

function App() {
  return (
    <div className={styles.root}>
      <Loader />
    </div>
  )
}

export default App
