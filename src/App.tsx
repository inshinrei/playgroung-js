import React from 'react'
import { RecentsList } from './bin-but-not-binary/playg/InfiniteList'

const data = Array.from({ length: 1000 }).fill(Math.random().toString())

function App() {
  return (
    <div>
      <RecentsList entries={data} />
    </div>
  )
}

export default App
