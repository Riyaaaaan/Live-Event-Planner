import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { getEvent } from '../services/eventService'
import {
  registerForEvent,
  registerForProgram,
  isUserRegisteredForEvent,
  isUserRegisteredForProgram,
  getRegistrationsForEvent,
  getRegistrationsForUser,
} from '../services/registrationService'
import { useAuth } from '../hooks/useAuth'
import { EventDetails } from '../components/events/EventDetails'
import { RegistrationForm } from '../components/events/RegistrationForm'
import { Loader } from '../components/common/Loader'

export function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [programRegistrationMode, setProgramRegistrationMode] = useState(null)
  const [programRegistering, setProgramRegistering] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [registrationResult, setRegistrationResult] = useState(null)
  const [registeredProgramIds, setRegisteredProgramIds] = useState([])

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
    if (!id || !user || !alreadyRegistered) return
    let cancelled = false
    getRegistrationsForUser(user.uid)
      .then((regs) => {
        if (cancelled) return
        const myReg = regs.find((r) => r.eventId === id)
        if (myReg?.id && Array.isArray(myReg.programIds) && myReg.programIds.length > 0) {
          setRegistrationResult({ registrationId: myReg.id, programIds: myReg.programIds })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [id, user, alreadyRegistered])

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

  useEffect(() => {
    if (!id || !user) {
      setRegisteredProgramIds([])
      return
    }
    let cancelled = false
    getRegistrationsForUser(user.uid)
      .then((regs) => {
        if (cancelled) return
        const eventRegs = regs.filter((r) => r.eventId === id)
        const programIds = []
        eventRegs.forEach((r) => {
          if (Array.isArray(r.programIds)) {
            r.programIds.forEach((pid) => {
              if (!programIds.includes(pid)) programIds.push(pid)
            })
          }
        })
        setRegisteredProgramIds(programIds)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [id, user])

  async function handleRegister(formData) {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    setRegistering(true)
    try {
      const registrationId = await registerForEvent(
        id,
        user.uid,
        'default',
        1,
        {
          displayName: profile?.displayName ?? user.displayName ?? '',
          email: user.email ?? '',
          phone: formData.phone,
          class: formData.class,
          section: formData.section,
          branch: formData.branch,
        },
        formData.programIds ?? []
      )
      toast.success('You’re registered!')
      setAlreadyRegistered(true)
      setRegistrationResult({
        registrationId,
        programIds: formData.programIds ?? [],
      })
      setEvent((e) => e ? { ...e, currentAttendees: (e.currentAttendees || 0) + 1 } : null)
      if (event?.organizerId === user.uid) {
        setRegistrationsLoading(true)
        getRegistrationsForEvent(id)
          .then((regs) => setRegistrations(regs))
          .catch(() => setRegistrations((prev) => prev))
          .finally(() => setRegistrationsLoading(false))
      }
    } catch (e) {
      toast.error(e.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  async function handleProgramRegister(formData) {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    setProgramRegistering(true)
    try {
      const programIndex = programRegistrationMode
      const registrationId = await registerForProgram(
        id,
        programIndex,
        user.uid,
        {
          displayName: profile?.displayName ?? user.displayName ?? '',
          email: user.email ?? '',
          phone: formData.phone,
          class: formData.class,
          section: formData.section,
          branch: formData.branch,
        }
      )
      toast.success('You are registered for this program!')
      setRegisteredProgramIds((prev) => [...new Set([...prev, programIndex])])
      setRegistrationResult({
        registrationId,
        programIds: [programIndex],
      })
      setProgramRegistrationMode(null)
      if (event?.organizerId === user.uid) {
        setRegistrationsLoading(true)
        getRegistrationsForEvent(id)
          .then((regs) => setRegistrations(regs))
          .catch(() => setRegistrations((prev) => prev))
          .finally(() => setRegistrationsLoading(false))
      }
    } catch (e) {
      toast.error(e.message || 'Registration failed')
    } finally {
      setProgramRegistering(false)
    }
  }

  function startProgramRegistration(programIndex) {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    setProgramRegistrationMode(programIndex)
  }

  function cancelProgramRegistration() {
    setProgramRegistrationMode(null)
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
    (event.visibility === 'public' || event.visibility === 'private') &&
    !alreadyRegistered &&
    (event.capacity == null || (event.currentAttendees || 0) < event.capacity)
  const canEdit = user && (event.organizerId === user.uid)
  const showQR = registrationResult?.programIds?.length > 0
  const verifyUrl = showQR && registrationResult?.registrationId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${id}/${registrationResult.registrationId}`
    : ''

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
        <EventDetails
          event={event}
          onRegisterProgram={user ? startProgramRegistration : undefined}
          registeredProgramIds={registeredProgramIds}
        />
      </div>
      {programRegistrationMode !== null && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-gray-900">Program Registration</h3>
            <button
              type="button"
              onClick={cancelProgramRegistration}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <RegistrationForm
            event={event}
            onRegister={handleProgramRegister}
            isSubmitting={programRegistering}
            mode="program"
            selectedProgramIndex={programRegistrationMode}
          />
        </div>
      )}
      {canRegister && (
        <div className="mt-8">
          <RegistrationForm
            event={event}
            onRegister={handleRegister}
            isSubmitting={registering}
          />
        </div>
      )}
      {user && alreadyRegistered && !showQR && (
        <div className="mt-8 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-primary-800">
          You&apos;re already registered for this event.
        </div>
      )}
      {user && alreadyRegistered && showQR && verifyUrl && (
        <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <h3 className="font-display text-lg font-bold text-primary-900">Your program registration QR</h3>
          <p className="mt-1 text-sm text-primary-800">
            Show this QR when entering programs you registered for. Scanning it will display your registered programs.
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex-shrink-0 rounded-lg border-4 border-white bg-white p-2 shadow-md">
              <QRCodeSVG value={verifyUrl} size={200} level="M" />
            </div>
            <div className="text-sm text-primary-800">
              <p className="font-medium">Registered programs:</p>
              <ul className="mt-1 list-inside list-disc">
                {(event?.programs ?? [])
                  .filter((_, i) => registrationResult.programIds.includes(i))
                  .map((p, idx) => (
                    <li key={idx}>{p.title || `Program ${idx + 1}`}</li>
                  ))}
              </ul>
            </div>
          </div>
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
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
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
                      Phone
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Class / Section / Branch
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Programs
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {registrations.map((reg) => {
                    const eventPrograms = event?.programs ?? []
                    const programTitles = (reg.programIds ?? [])
                      .map((i) => eventPrograms[i]?.title || `#${i + 1}`)
                      .filter(Boolean)
                    return (
                      <tr key={reg.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {reg.displayName || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {reg.email || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {reg.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {[reg.class, reg.section, reg.branch].filter(Boolean).join(' / ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {programTitles.length > 0 ? programTitles.join(', ') : '—'}
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
