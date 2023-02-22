import { useState, useEffect } from 'react'

export function useCurrentDate(): Date {
  const [date, setDate] = useState(new Date())
  useEffect(() => {
    let interval: NodeJS.Timeout = setInterval(() => {
      let update = new Date()
      if (update.getSeconds() !== date.getSeconds()) {
        setDate(update)
      }
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [date])

  return date
}
