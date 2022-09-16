import {
  useRef,
  useState,
  useEffect,
  Dispatch,
  useCallback,
  EffectCallback,
  SetStateAction,
} from 'react'

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
