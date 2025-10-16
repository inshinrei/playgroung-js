import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import {
  halua,
  NewJSONHandler,
  NewTextHandler,
  NewWebConsoleHandler,
} from '../../projects/inshinrei/halua/src'
import { main } from './sub_1'

let logger = halua.New([
  NewTextHandler(self.console.info),
  NewWebConsoleHandler(self.console),
  NewJSONHandler(self.console.info),
])

function App() {
  useEffect(() => {
    main()
  })

  function run() {
    let arr = Array.from({ length: 1000 }).fill({ value: 'propov' })
    for (let v of arr) {
      logger.info(v)
    }
    console.log('done', arr.length)
  }

  return (
    <div>
      <CastMain />
      <div onClick={main}>click</div>
    </div>
  )
}

export default App
