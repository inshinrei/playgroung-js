import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import {
  halua,
  NewTextHandler,
  NewWebConsoleHandler,
} from '../../projects/inshinrei/halua/src'

function App() {
  useEffect(() => {
    halua.debug('message')
    halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')

    halua.debug('message', 'aaaa')

    let logger = halua.New([
      NewWebConsoleHandler(self.console, {
        pretty: true,
      }),
    ])
    let logger2 = logger.With('count', 2)
    logger2.debug('logger 2 debug message')
    logger2.info('logger 2 info')
    logger2.warn('logger 2 warn')
    logger2.error('logger 2 error')

    logger.debug('logger 1 info')
    logger2.info('logger 2 attempts to log')
    let logger3 = logger2.New(NewTextHandler(self.console.log))
    logger3.assert(false, 'ASSERTION')
    logger3.assert(true, 'WOW')
    logger3.info({
      prop: {
        nested: {
          val: new Map([['keka', 1]]),
        },
      },
    })

    let textLogger = halua
      .New(NewTextHandler(self.console.log))
      .withMessageFormat('[some prefix] %t %l %a > %w')
    textLogger.info('infoooo')
    textLogger.With('aboba').info('infooo abobbba')

    let webLogger = halua.New(
      NewWebConsoleHandler(self.console, {
        messageFormat: '[aboba] %t - %l : %a',
      }),
    )
    webLogger.info('keka')
    // console 100_000 4889.900000095367
    // JSON 100_000    5929.099999904633
    // web 100_000     3630.800000190735

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
