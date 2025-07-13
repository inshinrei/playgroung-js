import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import {
  halua,
  NewJSONHandler,
  NewTextHandler,
  NewWebBrowserConsoleHandler,
} from '../../projects/inshinrei/halua/src'

function App() {
  useEffect(() => {
    // halua.debug('message')
    // halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')
    // const logger = halua.New(TextHandler)
    // logger.debug('debug with text')
    // halua.debug('message', 'aaaa')
    // let logger = halua.New(JSONHandler(self.console.log), { minLevel: 'ERR' })
    // logger.debug('debug message')
    // logger.info(
    //   'info message',
    //   [1, 2, 3, 4, 5],
    //   new Set([1, 2, 3, 4, 5]),
    //   {
    //     obj: 'propa',
    //     ne: { p: 'val' },
    //   },
    //   undefined,
    //   null,
    //   new Map([['key', 'value']]),
    // )
    // let logger2 = halua.With('count', 2)
    // logger2.debug('logger 2 debug message')
    // logger2.info('logger 2 info')
    //
    // let logger3 = logger2.With('some op')
    // logger3.debug('logger 3 debug message')
    //
    // let logger4 = logger3.New(WebBrowserConsoleHandler(self.console))
    // logger4.debug('logger 4 debug message')
    // let logger5 = logger2.New({ minLevel: Level.Warn })
    // logger5.debug('logger5  debug message')
    // logger5.warn('logger5 warn')
    // let logger6 = logger5.New(JSONHandler(self.console.log), {
    //   minLevel: Level.Warn,
    // })
    // logger6.debug('logger6  debug message')
    // logger6.error('logger6   message')
    let loggerWEb = halua.New(NewWebBrowserConsoleHandler(self.console))
    let loggerJSON = halua.New(NewJSONHandler(self.console.log))

    loggerJSON.info('App loaded')

    let logger = halua.New([
      NewJSONHandler(self.console.log),
      NewTextHandler(self.console.log),
      NewWebBrowserConsoleHandler(self.console, { pretty: true }),
    ])
    logger.info('poooo')
    logger.debug(true, 'pizda', 'count', { prop: 'val' })
    logger.info(
      window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches,
    )
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      // dark mode
    }
    logger.info(1)
    logger.info(2, ' fhashf safh sa')
    
    logger.debug()
    logger.warn()
    logger.error()
    logger.info()
    // console 100_000 4889.900000095367
    // JSON 100_000    5929.099999904633
    // web 100_000     3630.800000190735

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
