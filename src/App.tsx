import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { LoggerCore } from './projects/logger-halua/loggerCore'

const haluaBeta = new LoggerCore()

function App() {
  useEffect(() => {
    // halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')

    haluaBeta.debug('message')
    haluaBeta.assert(
      false,
      'second message',
      'count',
      2,
      'somethingElse',
      'aboba',
      'none',
    )
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
