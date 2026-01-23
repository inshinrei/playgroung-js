import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { NewConsoleHandler } from '../../projects/inshinrei/halua/src/main/handlers/ConsoleHandler'
import { NewTextHandler } from '../../projects/inshinrei/halua/src/main/handlers/TextHandler'
import { NewJSONHandler } from '../../projects/inshinrei/halua/src/main/handlers/JSONHandler'
import { Halua } from '../../projects/inshinrei/halua/src/main/halua'

let halua = new Halua([], {})
let h = halua.New([
    NewTextHandler(self.console.info),
    NewConsoleHandler(self.console),
    NewJSONHandler(self.console.info),
])

class CustomError extends Error {
    constructor(message: string) {
        super(message)
    }
}

function log() {
    let t = performance.now()

    h.info(...args)
    let gt = performance.now() - t

    t = performance.now()
    console.info(...args)
    let bt = performance.now() - t

    console.info('log att', bt - gt)
    console.info('\n\n')
}

let args = [
    'string',
    123,
    [1, 2, 3],
    new WeakSet(),
    { prop: 'value', second: 'keka' },
    new Error('DataError'),
    new CustomError('Migrate'),
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
