import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { halua } from './projects/logger-halua'

function App() {
  useEffect(() => {
    // halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')
    halua.debug('message')
    halua.debug('second message', 'count', 2, 'somethingElse', 'aboba', 'none')
    halua.info('info')

    let logger = halua.With('some constant operation', 'abobikiCount', 35)
    logger.debug('message')
    logger.debug('second message', 'count', 2, 'somethingElse', 'aboba', 'none')
    logger.info('info')

    let logger2 = logger.With(
      'not some constant operation',
      'NonabobikiCount',
      40,
    )
    logger2.debug('message')
    logger2.debug(
      'second message',
      'count',
      2,
      'somethingElse',
      'aboba',
      'none',
    )
    logger2.info('info')
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
