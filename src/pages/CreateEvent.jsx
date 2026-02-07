import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createEvent } from '../services/eventService'
import { useAuth } from '../hooks/useAuth'
import { EventForm } from '../components/events/EventForm'
import { Loader } from '../components/common/Loader'

export function CreateEvent() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [isSubmitting, setSubmitting] = useState(false)

  if (authLoading) return <Loader />
  if (!user) {
    navigate('/login', { state: { from: '/create' } })
    return null
  }
  if (profile?.role !== 'organizer' && profile?.role !== 'admin') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-gray-900">Organizer access required</h1>
          <p className="mt-2 text-gray-600">
            Your account does not have permission to create events. Contact support to become an organizer.
          </p>
        </div>
      </main>
    )
  }

  async function onSubmit(data) {
    setSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description || '',
        category: data.category,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacity: data.capacity ?? 100,
        visibility: data.visibility,
        status: data.status,
        organizerId: user.uid,
        location: {
          type: data['location.type'],
          address: data['location.address'] || '',
          virtualLink: data['location.virtualLink'] || '',
        },
        programs: Array.isArray(data.programs) ? data.programs : [],
      }
      const id = await createEvent(payload)
      toast.success('Event created!')
      navigate(`/events/${id}`)
    } catch (e) {
      toast.error(e.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Create event</h1>
      <p className="mt-1 text-gray-600">Add a new event for others to discover and register.</p>
      <div className="mt-8 card p-6">
        <EventForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </div>
    </main>
  )
}
