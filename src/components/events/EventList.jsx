import { EventCard } from './EventCard'
import { Loader } from '../common/Loader'

export function EventList({ events, loading, error, emptyMessage }) {
  if (loading) return <Loader />
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    )
  }
  if (!events?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-600">
        {emptyMessage ?? "No events yet. Check back later or create one if you&apos;re an organizer."}
      </div>
    )
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
