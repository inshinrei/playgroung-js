import React from 'react'
import './App.css'

import GamesApp from './test/components/GamesApp'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <GamesApp />
      </BrowserRouter>
    </div>
  )
}

export default App
