import times from 'lodash.times'

import { Guess } from './types'

export const VARIANTS_NUMBER = 8
export const CELLS_NUMBER = 5

export const checkGuess = (cypher: number[], guess: number[]): Guess => {
  const exactPositions = new Set<number>()

  for (let i = 0; i < CELLS_NUMBER; i += 1) {
    const value = guess[i]

    if (value === cypher[i]) {
      exactPositions.add(i)
    }
  }

  const guessValues = times(VARIANTS_NUMBER, () => 0)
  const otherValues = times(VARIANTS_NUMBER, () => 0)

  for (let i = 0; i < CELLS_NUMBER; i += 1) {
    if (!exactPositions.has(i)) {
      const index = cypher[i] - 1
      otherValues[index] = (otherValues[index] ?? 0) + 1

      const secondIndex = guess[i] - 1
      guessValues[secondIndex] = (guessValues[secondIndex] ?? 0) + 1
    }
  }

  let invalidPosition = 0

  for (let i = 0; i < VARIANTS_NUMBER; i += 1) {
    invalidPosition += Math.min(otherValues[i], guessValues[i])
  }

  return {
    cypher: guess,
    exactPosition: exactPositions.size,
    invalidPosition,
  }
}
