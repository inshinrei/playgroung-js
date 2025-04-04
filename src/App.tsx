import React from 'react'

import styles from './App.module.scss'
import { SomeComponent } from './bin-but-not-binary/noir-test/comp'

function App() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <div
        className={styles.root}
        style={{
          width: 350,
          padding: '20px',
          height: 750,
          border: '1px solid blue',
        }}
      >
        <SomeComponent />
      </div>
    </div>
  )
}

export default App
