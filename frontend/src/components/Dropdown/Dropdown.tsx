import React, { useRef, useState, useEffect } from 'react'

import styles from './Dropdown.module.scss'

import difference from 'ramda/src/difference'
import pluck from 'ramda/src/pluck'
import uniq from 'ramda/src/uniq'

import { List, ListItem } from '../List'
import { KEY_CODES } from '../../constants/keyCodes'

type Props = {
  items: any[]
  value?: string | string[] | undefined
  onSelect: Function
  valueField: string
  className?: string
  placeholder?: string
  isCompact?: string
  isMultiple?: boolean
  noBorder?: boolean
  disabled?: boolean
  listItemRenderer?: Function
  valueRenderer?: Function
  onClick?: Function
}

function Dropdown({
  items,
  value,
  className,
  onSelect,
  valueField,
  placeholder,
  isCompact,
  isMultiple,
  noBorder,
  disabled,
  listItemRenderer,
  valueRenderer,
  onClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef()

  let openingTimeout: NodeJS.Timeout | undefined

  /** Did Mount / Will Unmount */
  useEffect(() => {
    openingTimeout = setTimeout(() => {
      window.addEventListener('click', onAwayClick)
    }, 100)

    return () => {
      clearTimeout(openingTimeout)
      window.removeEventListener('click', onAwayClick)
    }
  }, [])

  function onAwayClick(event: MouseEvent) {
    if (!dropdownRef?.current?.contains(event.target as Node)) {
      handleClose()
    }
  }

  function handleOpen() {
    if (isOpen) {
      return
    }

    if (items.length > 1 || (items.length === 1 && items[0][valueField] !== value)) {
      setIsOpen(true)
    }
  }

  function handleClose() {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  function handleClick() {
    if (disabled) {
      return
    }

    if (isOpen) {
      if (!isMultiple) {
        handleClose()
      }
    } else {
      handleOpen()
    }

    if (onClick && !isMultiple) {
      onClick()
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) {
      return
    }

    if (event.key === KEY_CODES.ENTER || event.code === KEY_CODES.ENTER) {
      if (isOpen) {
        handleClose()
      } else {
        handleOpen()
      }

      if (onClick) {
        onClick()
      }
    }

    if (event.key === KEY_CODES.ESC || event.code === KEY_CODES.ESC) {
      if (isOpen && !isMultiple) {
        handleClose()
      }
    }
  }

  function handleSelect(item: any) {
    return () => {
      if (onSelect) {
        if (isMultiple && Array.isArray(value)) {
          let newItems: any[]

          if (value.find(element => element === item[valueField])) {
            newItems = value.filter(element => element !== item[valueField])
          } else {
            newItems = [...value, item[valueField]]
          }

          const allItems = pluck(valueField)(items)
          if (!difference(allItems)(newItems).length) {
            newItems = []
          }

          onSelect(uniq(newItems), item)
        } else {
          onSelect(item[valueField], item)
        }
      }

      if (!isMultiple) {
        handleClose()
      }
    }
  }

  function handleSelectByKeyboard(event: React.KeyboardEvent, item: any) {
    if (event.key === KEY_CODES.ENTER || event.code === KEY_CODES.ENTER) {
      handleSelect(item)
    }
  }

  function renderValue() {
    if (valueRenderer) {
      return valueRenderer()
    }

    let text = placeholder

    if (value) {
      if (isMultiple && Array.isArray(value)) {
        const textArray = value.map(selectedValue => {
          const selectedItem = items.find(item => item[valueField] === selectedValue)

          if (selectedItem) {
            return selectedItem.label
          }

          return null
        })

        text = textArray.join(', ')
      } else {
        const selectedItem = items.find(item => item[valueField] === value)

        if (selectedItem) {
          text = selectedItem.label
        }
      }
    }

    return <div className={styles.basicValue}>{text}</div>
  }

  function renderItems() {
    let filteredItems = items

    if (!isMultiple) {
      filteredItems = items.filter(item => item[valueField] !== value)
    }

    if (listItemRenderer) {
      return listItemRenderer(items, handleSelect)
    }

    return filteredItems.map(item => (
      <ListItem
        key={item[valueField]}
        className={styles.listItem}
        onKeyDown={event => handleSelectByKeyboard(event, item)}
        onItemClick={handleSelect(item)}
      >
        {item.label}
      </ListItem>
    ))
  }

  return (
    <div
      className={`${className} ${styles.dropdown} ${isCompact ? styles.compact : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown as any}
    >
      <div className={`${isOpen ? styles.isOpen : ''} ${noBorder ? styles.noBorder : ''}`}>
        {renderValue()}
      </div>
      {isOpen && <List className={styles.itemsList}>{renderItems()}</List>}
    </div>
  )
}

Dropdown.defaultProps = {
  placeholder: '',
  isCompact: false,
  isMulti: false,
  disabled: false,
  noCheckmark: false,
  noBorder: false,
  value: null,
  valueField: 'value',
  listItemRenderer: undefined,
  valueRenderer: undefined,
  onClick: undefined,
}

export default React.memo(Dropdown)
