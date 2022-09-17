import { useRef, useEffect } from 'react'

interface Options {
  restoreUnUnmount?: boolean
}

const initialOptions: Options = {
  restoreUnUnmount: false,
}

export function useTitle(title: string, options: Options = initialOptions) {
  const previousTitleRef = useRef(document.title)

  if (document.title !== title) {
    document.title = title
  }

  useEffect(() => {
    if (options?.restoreUnUnmount) {
      return () => {
        document.title = previousTitleRef.current
      }
    } else {
      return
    }
  }, [])
}
