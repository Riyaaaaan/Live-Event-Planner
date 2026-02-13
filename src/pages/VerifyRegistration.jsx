import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvent } from '../services/eventService'
import { getRegistrationById } from '../services/registrationService'
import { Loader } from '../components/common/Loader'

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

  const programs = event?.programs ?? []
  const registeredPrograms = (registration.programIds ?? [])
    .map((index) => programs[index])
    .filter(Boolean)

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-xl font-bold text-gray-900">Registration details</h1>
        <p className="mt-1 text-sm text-gray-500">This QR links to the following registration.</p>

        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Attendee</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {registration.displayName || '—'}
            </dd>
            {registration.email && (
              <dd className="text-sm text-gray-600">{registration.email}</dd>
            )}
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Event</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{event?.title || '—'}</dd>
          </div>
          {registeredPrograms.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Registered programs</dt>
              <dd className="mt-1">
                <ul className="list-inside list-disc space-y-0.5 text-gray-900">
                  {registeredPrograms.map((p, idx) => (
                    <li key={idx}>{p.title || `Program ${idx + 1}`}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <Link to="/events" className="btn-secondary mt-6 inline-block">
          ← Back to events
        </Link>
      </div>
    </main>
  )
}
