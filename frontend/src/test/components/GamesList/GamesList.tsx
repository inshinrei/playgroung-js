import React, { useState } from 'react'
import styles from './GamesList.module.scss'

import { List, ListItem } from 'components/List'
import useGamesList from '../../hooks/useGamesList'
import { Currencies, Provider } from './types'
import Dropdown from '../../../components/Dropdown'
import { Link } from 'react-router-dom'

const currencies = Currencies.map(currency => ({
  label: currency,
  name: currency,
}))

const providers = Provider.map(provider => ({
  label: provider,
  name: provider,
}))

function GamesList() {
  const { items, hasMore, fetchMore } = useGamesList()

  const [currencyFilter, setCurrencyFilter] = useState<string | undefined>(undefined)
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined)

  const filteredItems = items.filter(game => {
    if (currencyFilter && providerFilter) {
      // @ts-ignore
      return game.provider === providerFilter && game.real[currencyFilter]
    }

    if (currencyFilter) {
      // @ts-ignore
      return game.real[currencyFilter]
    }

    if (providerFilter) {
      return game.provider === providerFilter
    }

    return true
  })

  function onCurrencySelect(currency: string) {
    setCurrencyFilter(currency)
  }

  function onProviderSelect(provider: string) {
    setProviderFilter(provider)
  }

  return (
    <div className={styles.root}>
      <div className={styles.filtersWrapper}>
        <Dropdown
          value={currencyFilter}
          placeholder="Currencies"
          items={currencies}
          onSelect={onCurrencySelect}
          valueField="name"
        />
        <Dropdown
          value={providerFilter}
          placeholder="Providers"
          items={providers}
          onSelect={onProviderSelect}
          valueField="name"
        />
      </div>

      <List className={styles.list}>
        {filteredItems.map(game => (
          <ListItem key={game.title} className={styles.listItem}>
            <Link to={`game/${game.demo}`}>{game.title}</Link>
          </ListItem>
        ))}
      </List>

      {hasMore && (
        <button className={styles.button} onClick={() => fetchMore()}>
          Load more
        </button>
      )}
    </div>
  )
}

export default GamesList
