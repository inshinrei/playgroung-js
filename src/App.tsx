import React from 'react'
import { InfiniteScroll } from './bin-but-not-binary/playg/InfiniteList'

const data = Array.from({ length: 100 }).fill(Math.random().toString())

function App() {
  return (
    <div>
      <InfiniteScroll entries={data}>
        {data.map((n) => (
          <div>
            <p>{n}</p>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default App
