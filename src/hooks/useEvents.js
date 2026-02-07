import { useState, useEffect } from 'react'
import { getEvents, getEventsByOrganizer } from '../services/eventService'

export function useEvents(organizerId = null) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(organizerId !== undefined)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (organizerId === undefined) {
      setEvents([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    console.log('[useEvents] fetch', { organizerId: organizerId ?? 'public' })
    const fetch = organizerId ? getEventsByOrganizer(organizerId) : getEvents()
    fetch
      .then((data) => {
        if (!cancelled) {
          setEvents(data)
          console.log('[useEvents] fetch success', { count: data?.length ?? 0, organizerId: organizerId ?? 'public' })
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message)
          console.log('[useEvents] fetch error', { error: e.message, organizerId: organizerId ?? 'public' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [organizerId])

  return { events, loading, error }
}
