import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useRegisteredEvents } from '../hooks/useRegisteredEvents'
import { EventList } from '../components/events/EventList'
import { Loader } from '../components/common/Loader'
import { isEventPast } from '../utils/formatters'

export function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin'
  const { events, loading: eventsLoading } = useEvents(isOrganizer ? user?.uid ?? null : undefined)
  const { events: discoverEvents, loading: discoverLoading } = useEvents(null)
  const { events: registeredEvents, loading: registeredLoading } = useRegisteredEvents(user?.uid ?? null)

  const { upcomingEvents, previousEvents, upcomingRegistered, previousRegistered, upcomingDiscover, previousDiscover } = useMemo(() => {
    const split = (list) => {
      if (!list?.length) return { upcoming: [], previous: [] }
      const upcoming = list.filter((e) => !isEventPast(e))
      const previous = list.filter((e) => isEventPast(e))
      return { upcoming, previous }
    }
    const org = split(events)
    const reg = split(registeredEvents)
    const disc = split(discoverEvents)
    return {
      upcomingEvents: org.upcoming,
      previousEvents: org.previous,
      upcomingRegistered: reg.upcoming,
      previousRegistered: reg.previous,
      upcomingDiscover: disc.upcoming,
      previousDiscover: disc.previous,
    }
  }, [events, registeredEvents, discoverEvents])

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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Welcome back, {profile?.displayName || user.email}.
      </p>

      {isOrganizer && (
        <>
          <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
            <Link to="/create" className="btn-primary w-full sm:w-auto text-center">
              Create event
            </Link>
          </div>
          <section className="mt-8 sm:mt-10">
            <h2 className="font-display text-xl font-bold text-gray-900">Your events</h2>
            <p className="mt-1 text-gray-600">Events you created (upcoming).</p>
            <div className="mt-6">
              <EventList events={upcomingEvents} loading={eventsLoading} error={null} />
            </div>
            {previousEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-gray-700">Previous events</h3>
                <p className="mt-0.5 text-sm text-gray-500">Events whose date has passed.</p>
                <div className="mt-4">
                  <EventList events={previousEvents} loading={false} error={null} />
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section className="mt-8 sm:mt-10">
        <h2 className="font-display text-xl font-bold text-gray-900">Registered events</h2>
        <p className="mt-1 text-gray-600">Events you&apos;ve signed up for as an attendee.</p>
        <div className="mt-6">
          <EventList
            events={upcomingRegistered}
            loading={registeredLoading}
            error={null}
            emptyMessage={
              previousRegistered.length > 0
                ? 'No upcoming registered events.'
                : isOrganizer
                  ? "You haven't registered for any events yet."
                  : "You haven't registered for any events yet. Browse discover events below."
            }
          />
        </div>
        {previousRegistered.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-semibold text-gray-700">Previous events</h3>
            <p className="mt-0.5 text-sm text-gray-500">Past events you attended.</p>
            <div className="mt-4">
              <EventList events={previousRegistered} loading={false} error={null} />
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 sm:mt-10">
        <h2 className="font-display text-xl font-bold text-gray-900">Discover events</h2>
        <p className="mt-1 text-gray-600">Browse public events.</p>
        <div className="mt-6">
          <EventList events={upcomingDiscover} loading={discoverLoading} error={null} />
        </div>
        {previousDiscover.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-semibold text-gray-700">Previous events</h3>
            <p className="mt-0.5 text-sm text-gray-500">Past public events.</p>
            <div className="mt-4">
              <EventList events={previousDiscover} loading={false} error={null} />
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
