import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getEvent, updateEvent } from '../services/eventService'
import { useAuth } from '../hooks/useAuth'
import { EventForm } from '../components/events/EventForm'
import { Loader } from '../components/common/Loader'

export function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    getEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data)
      })
      .catch(() => {
        if (!cancelled) setEvent(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  if (authLoading || loading) return <Loader />
  if (!user) {
    navigate('/login', { state: { from: `/events/${id}/edit` } })
    return null
  }
  if (!event) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold text-gray-900">Event not found</h1>
        <Link to="/events" className="btn-primary mt-4 inline-block">
          Back to events
        </Link>
      </main>
    )
  }
  if (event.organizerId !== user.uid && profile?.role !== 'admin') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-gray-900">Not authorized</h1>
          <p className="mt-2 text-gray-600">You can only edit events you created.</p>
        </div>
      </main>
    )
  }

  async function onSubmit(data) {
    setSubmitting(true)
    try {
      await updateEvent(id, {
        title: data.title,
        description: data.description || '',
        category: data.category,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacity: data.capacity ?? 100,
        visibility: data.visibility,
        status: data.status,
        location: {
          type: data['location.type'],
          address: data['location.address'] || '',
          virtualLink: data['location.virtualLink'] || '',
        },
        programs: Array.isArray(data.programs) ? data.programs : [],
      })
      toast.success('Event updated!')
      navigate(`/events/${id}`)
    } catch (e) {
      toast.error(e.message || 'Failed to update event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link to={`/events/${id}`} className="text-sm font-medium text-primary-600 hover:underline">
        ← Back to event
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-gray-900">Edit event</h1>
      <p className="mt-1 text-gray-600">Update event details.</p>
      <div className="mt-8 card p-6">
        <EventForm event={event} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </div>
    </main>
  )
}
