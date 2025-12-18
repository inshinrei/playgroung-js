import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import {
    halua,
    NewJSONHandler,
    NewTextHandler,
    NewWebConsoleHandler,
} from '../../projects/inshinrei/halua/src'
import { Halua } from '../../projects/inshinrei/halua/src/main/halua'

let logger = halua.New([
    NewTextHandler(self.console.info),
    NewWebConsoleHandler(self.console),
    NewJSONHandler(self.console.info),
])

let h = new Halua()

class CustomError extends Error {
    constructor(message: string) {
        super(message)
    }
}

function logs() {
    let t = performance.now()

    h.info(...args)
    console.info('generator log:', performance.now() - t)

    t = performance.now()
    console.info(...args)
    console.info('base log:', performance.now() - t)

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
        logs()
    })

    return (
        <div>
            <CastMain />

            <div
                onClick={() => {
                    logs()
                }}
            >
                log something
            </div>
        </div>
    )
}

export default App
