import { Link } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { EventList } from '../components/events/EventList'

export function Home() {
  const { events, loading, error } = useEvents()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-gray-900 sm:text-5xl">
          Live Event Planner
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Create, discover, and register for events. Real-time updates and a seamless experience.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/events" className="btn-primary">
            Browse events
          </Link>
          <Link to="/create" className="btn-secondary">
            Create event
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-gray-900">Upcoming events</h2>
        <p className="mt-1 text-gray-600">Public events you can register for.</p>
        <div className="mt-6">
          <EventList events={events} loading={loading} error={error} />
        </div>
      </section>
    </main>
  )
}
