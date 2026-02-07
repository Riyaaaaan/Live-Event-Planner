import { useState, useEffect } from 'react'
import { getRegistrationsForUser } from '../services/registrationService'
import { getEvent } from '../services/eventService'

export function useRegisteredEvents(userId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setEvents([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getRegistrationsForUser(userId)
      .then((regs) => {
        if (cancelled) return
        return Promise.all(regs.map((r) => getEvent(r.eventId)))
      })
      .then((eventList) => {
        if (cancelled || !eventList) return
        const valid = eventList.filter(Boolean)
        valid.sort((a, b) => (a.startDate?.getTime?.() ?? 0) - (b.startDate?.getTime?.() ?? 0))
        setEvents(valid)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  return { events, loading, error }
}
