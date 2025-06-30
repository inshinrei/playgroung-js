import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { halua } from './projects/logger-halua/src'

function App() {
  useEffect(() => {
    // halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')
    // const logger = halua.New(TextHandler)
    // logger.debug('debug with text')
    halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba', 'none')
    // halua.info('info')

    // let logger = halua.New(JSONHandler(self.console.log), { pretty: true })
    // let logger = halua.New(null, { pretty: true })
    // logger.debug('message')
    // logger.warn('warning')
    // logger.err('error')
    // logger.debug('second message', 'count', 2, 'somethingElse', 'aboba', 'none')
    // logger.info('info')
    //
    // let logger2 = logger.With(
    //   'not some constant operation',
    //   'NonabobikiCount',
    //   40,
    // )
    // logger2.debug('message')
    // logger2.debug(
    //   'second message',
    //   'count',
    //   2,
    //   'somethingElse',
    //   'aboba',
    //   'none',
    // )
    // logger2.info('info')
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
