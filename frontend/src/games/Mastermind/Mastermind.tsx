import React, { SyntheticEvent, useState } from 'react'
import styles from './Mastermind.module.css'

import last from 'lodash.last'
import times from 'lodash.times'
import { CELLS_NUMBER, checkGuess, VARIANTS_NUMBER } from './utils'

import { Guess } from './types'

const ValueRegExp = /\D+/g

function Mastermind() {
  const [cypher, setCypher] = useState<number[] | null>(null)
  const [currentValue, setCurrentValue] = useState('')

  const [guesses, setGuesses] = useState<Guess[]>([])

  const lastGuess = last(guesses)

  const handleGenerateCypher = () => {
    const generatedCypher = times(
      CELLS_NUMBER,
      () => Math.floor(Math.random() * VARIANTS_NUMBER) + 1
    )

    ;(window as any).cypher = generatedCypher.join('')
    setCypher(generatedCypher)
  }

  const onCurrentValueChange = ({ target }: any) => {
    setCurrentValue(target?.value.replace(ValueRegExp, ''))
  }

  const onSubmitCurrentValue = () => {
    const chars = currentValue.trim().split('')

    const values = chars.map(char => {
      const value = Number.parseInt(char, 10)

      if (!value || value > VARIANTS_NUMBER + 1) {
        window.alert(`Only allowed 1-${VARIANTS_NUMBER}`)
        throw new Error()
      }

      return value
    })

    if (values.length !== CELLS_NUMBER) {
      window.alert(`Should be exact ${CELLS_NUMBER} symbols`)
      throw new Error()
    }

    if (typeof cypher !== null) {
      setGuesses([...guesses, checkGuess(cypher as number[], values)])
      setCurrentValue('')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {cypher ? (
          <div>
            <h1>Mastermind</h1>
            <div className={styles.guessesList}>
              <div>Guesses:</div>
              {guesses.length
                ? guesses.map((guess, index) => (
                    <div key={index} className={styles.guessVariant}>
                      <span className={styles.guessIndex}>{index + 1}</span>
                      <input value={guess.cypher.join('')} readOnly />
                      Exact: {guess.exactPosition}, Some: {guess.invalidPosition}
                    </div>
                  ))
                : '---'}
            </div>
            {lastGuess && lastGuess.exactPosition === CELLS_NUMBER ? (
              <div>You have won</div>
            ) : (
              <div className={styles.inputBlock}>
                <span>Your guess:</span>
                <input value={currentValue} onChange={onCurrentValueChange} />
                <button type="button" onClick={onSubmitCurrentValue}>
                  Check
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={handleGenerateCypher}>
            Generate
          </button>
        )}
      </div>
    </div>
  )
}

export default Mastermind
