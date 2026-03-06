import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvent } from '../services/eventService'
import { getRegistrationById } from '../services/registrationService'
import { Loader } from '../components/common/Loader'
import { Ticket } from '../components/common/Ticket'

export function VerifyRegistration() {
  const { eventId, registrationId } = useParams()
  const [event, setEvent] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!eventId || !registrationId) {
      setError('Invalid link')
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([
      getEvent(eventId),
      getRegistrationById(eventId, registrationId),
    ])
      .then(([eventData, regData]) => {
        if (cancelled) return
        setEvent(eventData)
        setRegistration(regData)
        if (!regData) setError('Registration not found')
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [eventId, registrationId])

  if (loading) return <Loader />
  if (error || !registration) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="font-display text-xl font-bold text-gray-900">Invalid or expired link</h1>
        <p className="mt-2 text-gray-600">{error || 'This registration could not be found.'}</p>
        <Link to="/events" className="btn-primary mt-6 inline-block">
          Browse events
        </Link>
      </main>
    )
  }

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${eventId}/${registrationId}`
    : ''

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900">Event Ticket</h1>
        <p className="mt-1 text-gray-600">Scan this QR code at the entrance</p>
      </div>

      <Ticket
        event={event}
        registration={registration}
        verifyUrl={verifyUrl}
      />

      <div className="mt-6 text-center">
        <Link to="/events" className="text-sm font-medium text-primary-600 hover:underline">
          ← Browse all events
        </Link>
      </div>
    </main>
  )
}
