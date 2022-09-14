import React from 'react'

import { Route, Routes } from 'react-router-dom'

import GamesList from './GamesList'
import Game from './GamesList/Game'

function GamesApp() {
  return (
    <>
      <Routes>
        <Route element={<GamesList />} path="/">
          <Route element={<Game />} path="game/:id" />
        </Route>
      </Routes>
    </>
  )
}

export default GamesApp
