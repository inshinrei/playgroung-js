import React from 'react'
import { RecentsList } from './bin-but-not-binary/playg/ChatsList'

const data = Array.from({ length: 1000 })
  .fill(null)
  .map(() => (Math.random() * 100000).toString())

function App() {
  return (
    <div>
      <RecentsList entries={data} />
    </div>
  )
}

export default App
