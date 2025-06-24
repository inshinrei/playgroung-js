import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { LoggerCore } from './projects/logger-halua/loggerCore'
import { Level } from './projects/logger-halua/types'

const halua = new LoggerCore(null, { minLevel: Level.Debug })

function App() {
  useEffect(() => {
    // halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')
    halua.setDateGetter(() => performance.now())
    halua.debug('message')
    halua.debug('second message', 'count', 2, 'somethingElse', 'aboba', 'none')
    halua.info('info')
    halua.warn('warn')
    halua.err('error')
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
