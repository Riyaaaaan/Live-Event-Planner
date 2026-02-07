import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatters'

export function EventCard({ event }) {
  const { id, title, description, category, startDate, location, capacity, currentAttendees, bannerURL } = event
  const spotsLeft = capacity != null ? Math.max(0, capacity - (currentAttendees || 0)) : null

  return (
    <Link
      to={`/events/${id}`}
      className="card block overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-gray-200">
        {bannerURL ? (
          <img
            src={bannerURL}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600">
            <span className="font-display text-4xl font-bold">{category?.[0] ?? 'E'}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
          {category || 'Event'}
        </span>
        <h2 className="mt-1 font-display text-lg font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>{formatDate(startDate)}</span>
          {location?.address && <span>· {location.address}</span>}
          {spotsLeft != null && (
            <span className="font-medium text-primary-600">{spotsLeft} spots left</span>
          )}
        </div>
      </div>
    </Link>
  )
}
