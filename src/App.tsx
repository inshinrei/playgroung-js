import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import {
  halua,
  NewJSONHandler,
  NewTextHandler,
  NewWebConsoleHandler,
} from '../../projects/inshinrei/halua/src'

function App() {
  useEffect(() => {
    let logger = halua.New([
      NewTextHandler(self.console.info),
      NewWebConsoleHandler(self.console),
      NewJSONHandler(self.console.info),
      NewWebConsoleHandler(self.console, { pretty: true, exact: 'INFO+5' }),
    ])
    logger.info('some message', [])
    logger.logTo('INFO+5', 'pzed')

    logger.info('some message', [])
    logger.logTo('INFO+5', 'pzed')

    logger.appendHandler(NewTextHandler(self.console.warn))

    logger.info('some message', [])
    logger.logTo('INFO+5', 'pzed')
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
