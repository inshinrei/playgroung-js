import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { NewConsoleHandler } from '../../projects/inshinrei/halua/src/main/handlers/ConsoleHandler'
import { NewTextHandler } from '../../projects/inshinrei/halua/src/main/handlers/TextHandler'
import { NewJSONHandler } from '../../projects/inshinrei/halua/src/main/handlers/JSONHandler'
import { Halua } from '../../projects/inshinrei/halua/src/main/halua'

let halua = new Halua([], {})
let h = halua.New([
    NewTextHandler(self.console.info, {
        spacing: false,
    }),
    NewConsoleHandler(self.console, {}),
    NewJSONHandler(
        (v) => {
            self.console.info(v)
            console.assert(JSON.parse(v), 'json parsing failed')
        },
        { printTimestamp: false },
    ),
])

class CustomError extends Error {
    constructor(message: string) {
        super(message)
    }
}

function log() {
    let t = performance.now()

    let h2 = h.New({ level: 'NOTICE' })
    h2.info('no log')
    h2.notice('yes log')

    let end = h2.stamp('1', 'some func')
    end()
    h2.stampEnd('1')

    // t = performance.now()
    // console.info(...args)
    // let bt = performance.now() - t
    //
    // console.info('log att', bt - gt)
    console.info('\n\n')

    // let h2 = h.With('boolean', 213)
    //
    // let h3 = h2.With('op', null)
    // h3.notice('log')
}

let args = [
    'string',
    123,
    [1, 2, 3],
    new WeakSet(),
    { prop: 'value', second: 'keka' },
    // new CustomError('Migrate'),
]

function App() {
    useEffect(() => {
        log()
    })

    return (
        <div>
            <CastMain />

            <div
                onClick={() => {
                    log()
                }}
            >
                log something
            </div>
        </div>
    )
}

export default App
