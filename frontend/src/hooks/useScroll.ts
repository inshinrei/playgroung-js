import { RefObject, useEffect, useState } from 'react'
import { off, on } from '../utils/dom'

interface XYState {
  x: number
  y: number
}

export function useScroll(ref: RefObject<HTMLElement>): XYState {
  if (process.env.NODE_ENV === 'development') {
    if (typeof ref !== 'object' || typeof ref.current === 'undefined') {
      console.error(`useScroll: ref argument is invalid`)
    }
  }

  const [state, setState] = useState<XYState>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    function handler() {
      if (ref.current) {
        setState({ x: ref.current.scrollLeft, y: ref.current.scrollTop })
      }
    }

    if (ref.current) {
      on(ref.current, 'scroll', handler, { capture: false, passive: true })
    }

    return () => {
      if (ref.current) {
        off(ref.current, 'scroll', handler)
      }
    }
  }, [ref])

  return state
}
