import { useEvents } from '../hooks/useEvents'
import { EventList } from '../components/events/EventList'

export function Events() {
  const { events, loading, error } = useEvents()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Events</h1>
      <p className="mt-1 text-gray-600">Browse and register for upcoming events.</p>
      <div className="mt-8">
        <EventList events={events} loading={loading} error={error} />
      </div>
    </main>
  )
}
