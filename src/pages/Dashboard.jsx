import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useRegisteredEvents } from '../hooks/useRegisteredEvents'
import { EventList } from '../components/events/EventList'
import { Loader } from '../components/common/Loader'

export function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin'
  const { events, loading: eventsLoading } = useEvents(isOrganizer ? user?.uid ?? null : undefined)
  const { events: discoverEvents, loading: discoverLoading } = useEvents(null)
  const { events: registeredEvents, loading: registeredLoading } = useRegisteredEvents(user?.uid ?? null)

  if (authLoading) return <Loader />
  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-gray-900">Sign in required</h1>
          <p className="mt-2 text-gray-600">Log in to view your dashboard.</p>
          <Link to="/login" className="btn-primary mt-4 inline-block">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Welcome back, {profile?.displayName || user.email}.
      </p>

      {isOrganizer && (
        <>
          <div className="mt-8 flex gap-4">
            <Link to="/create" className="btn-primary">
              Create event
            </Link>
          </div>
          <section className="mt-8">
            <h2 className="font-display text-xl font-bold text-gray-900">Your events</h2>
            <p className="mt-1 text-gray-600">Events you created (all statuses).</p>
            <div className="mt-6">
              <EventList events={events} loading={eventsLoading} error={null} />
            </div>
          </section>
        </>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-gray-900">Registered events</h2>
        <p className="mt-1 text-gray-600">Events you&apos;ve signed up for as an attendee.</p>
        <div className="mt-6">
          <EventList
            events={registeredEvents}
            loading={registeredLoading}
            error={null}
            emptyMessage={
              isOrganizer
                ? "You haven't registered for any events yet."
                : "You haven't registered for any events yet. Browse discover events below."
            }
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-gray-900">Discover events</h2>
        <p className="mt-1 text-gray-600">Browse public events.</p>
        <div className="mt-6">
          <EventList events={discoverEvents} loading={discoverLoading} error={null} />
        </div>
      </section>
    </main>
  )
}
