import React, { useEffect } from 'react'
import { CastMain } from './projects/cast/main'
import { halua } from './projects/logger-halua/halua'

function App() {
  useEffect(() => {
    halua.debug('message')
    halua.debug('second message', 'count', 2, 'somethingElse', 'aboba')
  })

  return (
    <div>
      <CastMain />
    </div>
  )
}

export default App
