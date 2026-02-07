import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getEvent } from '../services/eventService'
import {
  registerForEvent,
  isUserRegisteredForEvent,
  getRegistrationsForEvent,
} from '../services/registrationService'
import { useAuth } from '../hooks/useAuth'
import { EventDetails } from '../components/events/EventDetails'
import { Loader } from '../components/common/Loader'

export function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)

  console.log('[EventDetail] render', { id, loading, hasEvent: !!event, eventId: event?.id, userId: user?.uid, canEdit: user && event?.organizerId === user?.uid })

  useEffect(() => {
    console.log('[EventDetail] fetch event', { id })
    let cancelled = false
    getEvent(id)
      .then((data) => {
        if (!cancelled) {
          console.log('[EventDetail] event loaded', { id, title: data?.title, organizerId: data?.organizerId })
          setEvent(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.log('[EventDetail] event fetch error', { id, error: err?.message })
          setEvent(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!id || !user) {
      console.log('[EventDetail] skip alreadyRegistered check', { id, hasUser: !!user })
      setAlreadyRegistered(false)
      return
    }
    let cancelled = false
    console.log('[EventDetail] check alreadyRegistered', { id, userId: user.uid })
    isUserRegisteredForEvent(id, user.uid)
      .then((registered) => {
        if (!cancelled) {
          console.log('[EventDetail] alreadyRegistered result', { id, registered })
          setAlreadyRegistered(registered)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.log('[EventDetail] alreadyRegistered error', { id, error: err?.message })
          setAlreadyRegistered(false)
        }
      })
    return () => { cancelled = true }
  }, [id, user])

  useEffect(() => {
    const isOrganizerView = id && event?.organizerId && user && event.organizerId === user.uid
    console.log('[EventDetail] registrations effect', { id, isOrganizerView, eventOrganizerId: event?.organizerId, userUid: user?.uid })
    if (!isOrganizerView) {
      setRegistrations([])
      setRegistrationsLoading(false)
      return
    }
    let cancelled = false
    setRegistrationsLoading(true)
    console.log('[EventDetail] fetch registrations', { id })
    getRegistrationsForEvent(id)
      .then((regs) => {
        if (!cancelled) {
          console.log('[EventDetail] registrations loaded', { id, count: regs?.length })
          setRegistrations(regs)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.log('[EventDetail] registrations error', { id, error: err?.message })
          setRegistrations([])
        }
      })
      .finally(() => {
        if (!cancelled) setRegistrationsLoading(false)
      })
    return () => { cancelled = true }
  }, [id, event?.organizerId, user?.uid])

  async function handleRegister() {
    if (!user) {
      console.log('[EventDetail] register: no user, redirect to login')
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    console.log('[EventDetail] register start', { id, userId: user.uid })
    setRegistering(true)
    try {
      await registerForEvent(id, user.uid, 'default', 1, {
        displayName: profile?.displayName ?? user.displayName ?? '',
        email: user.email ?? '',
      })
      toast.success('You’re registered!')
      setAlreadyRegistered(true)
      console.log('[EventDetail] register success', { id })
      setEvent((e) => e ? { ...e, currentAttendees: (e.currentAttendees || 0) + 1 } : null)
      if (event?.organizerId === user.uid) {
        setRegistrationsLoading(true)
        getRegistrationsForEvent(id)
          .then((regs) => setRegistrations(regs))
          .catch(() => setRegistrations((prev) => prev))
          .finally(() => setRegistrationsLoading(false))
      }
    } catch (e) {
      console.log('[EventDetail] register error', { id, error: e?.message })
      toast.error(e.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    console.log('[EventDetail] showing Loader (event loading)')
    return <Loader />
  }
  if (!event) {
    console.log('[EventDetail] event not found', { id })
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold text-gray-900">Event not found</h1>
        <Link to="/events" className="btn-primary mt-4 inline-block">
          Back to events
        </Link>
      </main>
    )
  }

  const canRegister =
    event.status === 'published' &&
    event.visibility === 'public' &&
    !alreadyRegistered &&
    (event.capacity == null || (event.currentAttendees || 0) < event.capacity)
  const canEdit = user && (event.organizerId === user.uid)

  console.log('[EventDetail] render content', { id, canRegister, canEdit, alreadyRegistered, registrationsCount: registrations.length, registrationsLoading })

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <Link to="/events" className="text-sm font-medium text-primary-600 hover:underline">
          ← Back to events
        </Link>
        {canEdit && (
          <Link to={`/events/${id}/edit`} className="btn-secondary text-sm">
            Edit event
          </Link>
        )}
      </div>
      <div className="mt-6">
        <EventDetails event={event} />
      </div>
      {canRegister && (
        <div className="mt-8">
          <button
            type="button"
            onClick={handleRegister}
            disabled={registering}
            className="btn-primary"
          >
            {registering ? 'Registering…' : 'Register for this event'}
          </button>
        </div>
      )}
      {user && alreadyRegistered && (
        <div className="mt-8 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-primary-800">
          You&apos;re already registered for this event.
        </div>
      )}
      {canEdit && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-gray-900">Registered attendees</h2>
          <p className="mt-1 text-gray-600">People who have registered for this event.</p>
          {registrationsLoading ? (
            <div className="mt-4 text-gray-500">Loading…</div>
          ) : !registrations.length ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
              No registrations yet.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {reg.displayName || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {reg.email || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {reg.registeredAt
                          ? new Date(reg.registeredAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
