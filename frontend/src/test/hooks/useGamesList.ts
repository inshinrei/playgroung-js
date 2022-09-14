import { useState } from 'react'

import games_data from './games_test.json'
import { GameType } from '../components/GamesList/types'

function readFromJSON(json: Object) {
  return Object.values(json)
}

function mockFetch(quantity: number) {
  const games: GameType[] = readFromJSON(games_data)

  const hasMore = !(quantity >= games.length)

  return {
    items: hasMore ? games.slice(0, quantity) : games,
    hasMore,
  }
}

export default function useGamesList({ step = 12 } = { step: 12 }) {
  const [quantity, setQuantity] = useState(step)

  const { items, hasMore } = mockFetch(quantity)

  function fetchMore(reset?: boolean) {
    if (reset) {
      setQuantity(step)

      return
    }

    if (hasMore) {
      setQuantity(quantity + step)
    }
  }

  return { items, hasMore, fetchMore }
}
