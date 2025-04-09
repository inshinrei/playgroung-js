import { useCallback, useRef, useState } from 'react'
import { AnyFunction } from './types'

export function useStateRef<T>(value: T) {
  let ref = useRef<T>(value)
  ref.current = value
  return ref
}

export function useLastCallback<F extends AnyFunction>(cb?: F) {
  let ref = useStateRef(cb)
  return useCallback(
    (...args: Parameters<F>) => ref.current?.(...args),
    [],
  ) as F
}

export function useForceUpdate() {
  let [, trigger] = useState(false)
  return useCallback(() => {
    trigger((s) => !s)
  }, [])
}

export function usePrevious<T extends any>(current: T) {
  let prevRef = useRef<T>()
  let lastRef = useRef<T>()
  if (lastRef.current !== current) {
    prevRef.current = lastRef.current
  }
  lastRef.current = current
  return prevRef.current
}
