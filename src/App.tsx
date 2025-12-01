import React from 'react'
import { CastMain } from './projects/cast/main'
import { halua, NewJSONHandler, NewTextHandler, NewWebConsoleHandler } from '../../projects/inshinrei/halua/src'
import { Halua } from '../../projects/inshinrei/halua/src/main/halua'

let logger = halua.New([
    NewTextHandler(self.console.info),
    NewWebConsoleHandler(self.console),
    NewJSONHandler(self.console.info),
])

let h = new Halua()

function App() {
    function run() {
        let arr = Array.from({ length: 1000 }).fill({ value: 'propov' })
        for (let v of arr) {
            logger.info(v)
        }
        console.log('done', arr.length)
    }

    return (
        <div>
            <CastMain />

            <div
                onClick={() => {
                    h.info('string', 123, [1, 2, 3])
                }}
            >
                log something
            </div>
        </div>
    )
}

export default App
