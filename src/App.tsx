import React from 'react'
import { add } from './bin-but-not-binary/indexeddb/main'

function App() {
  React.useEffect(() => {
    setTimeout(() => {
      add('some string')
    }, 2000)
  }, [])
  
  return <div></div>
}

export default App
