import { useState, useEffect } from 'react'

export function useRelationshipTimer(startDateISO: string) {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const start = new Date(startDateISO).getTime()

    const update = () => {
      const now = new Date().getTime()
      const diff = now - start

      if (diff < 0) return

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setElapsed({ days, hours, minutes, seconds })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startDateISO])

  return elapsed
}
