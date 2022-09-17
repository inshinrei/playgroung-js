import {
  useRef,
  useState,
  useEffect,
  Dispatch,
  RefObject,
  useCallback,
  EffectCallback,
  SetStateAction,
} from 'react'
import { on, off } from '../../utils/dom'

export function useEffectOnce(effect: EffectCallback) {
  useEffect(effect, [])
}

export function useUnmount(fn: () => any): void {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffectOnce(() => () => fnRef.current())
}

export function useRafState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const frame = useRef(0)
  const [state, setState] = useState(initialState)

  const setRafState = useCallback((value: S | ((prevState: S) => S)) => {
    cancelAnimationFrame(frame.current)

    frame.current = requestAnimationFrame(() => {
      setState(value)
    })
  }, [])

  useUnmount(() => {
    cancelAnimationFrame(frame.current)
  })

  return [state, setRafState]
}

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
