import { useState, useCallback } from 'react'
import Cookies from 'js-cookie'

type ReturnValue = [
  string | null,
  (newValue: string, options?: Cookies.CookieAttributes) => void,
  () => void
]

export function useCookie(name: string): ReturnValue {
  const [state, setState] = useState<string | null>(() => Cookies.get(name) ?? null)

  const updateCookie = useCallback(
    (newValue: string, options?: Cookies.CookieAttributes) => {
      Cookies.set(name, newValue, options)
      setState(newValue)
    },
    [name]
  )

  const deleteCookie = useCallback(() => {
    Cookies.remove(name)
    setState(null)
  }, [name])

  return [state, updateCookie, deleteCookie]
}
