import { formatDateTime } from '../../utils/formatters'

function formatProgramDateTime(dateTimeStr) {
  if (!dateTimeStr) return '—'
  const d = new Date(dateTimeStr)
  if (Number.isNaN(d.getTime())) return dateTimeStr
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventDetails({ event, onRegisterProgram, registeredProgramIds = [] }) {
  if (!event) return null
  const { title, description, category, startDate, endDate, location, capacity, currentAttendees, visibility, status, programs } = event
  const spotsLeft = capacity != null ? Math.max(0, capacity - (currentAttendees || 0)) : null
  const sortedPrograms = Array.isArray(programs) && programs.length
    ? [...programs].sort((a, b) => (a.dateTime || '').localeCompare(b.dateTime || ''))
    : []

  function getProgramSpotsLeft(program) {
    if (program.capacity == null) return null
    return Math.max(0, program.capacity - (program.currentAttendees || 0))
  }

  function isProgramFull(program) {
    if (program.capacity == null) return false
    return (program.currentAttendees || 0) >= program.capacity
  }

  function isProgramRegistered(programIndex) {
    return registeredProgramIds.includes(programIndex)
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-sm font-medium uppercase tracking-wide text-primary-600">
          {category || 'Event'}
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold text-gray-900">{title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600">
            {visibility}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600">
            {status}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Start</dt>
          <dd className="mt-0.5 font-medium text-gray-900">{formatDateTime(startDate)}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">End</dt>
          <dd className="mt-0.5 font-medium text-gray-900">{formatDateTime(endDate)}</dd>
        </div>
        {location?.type === 'physical' && location?.address && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{location.address}</dd>
          </div>
        )}
        {location?.type === 'virtual' && location?.virtualLink && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Virtual link</dt>
            <dd>
              <a
                href={location.virtualLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                {location.virtualLink}
              </a>
            </dd>
          </div>
        )}
        {capacity != null && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Capacity</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {currentAttendees ?? 0} / {capacity} registered
              {spotsLeft != null && spotsLeft > 0 && (
                <span className="ml-2 text-primary-600">({spotsLeft} spots left)</span>
              )}
            </dd>
          </div>
        )}
      </dl>

      {sortedPrograms.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-gray-900">Program</h2>
          <p className="mt-0.5 text-sm text-gray-500">Schedule by day and time.</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Day & time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Program
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Capacity
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Registration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedPrograms.map((p, index) => {
                  const spotsLeft = getProgramSpotsLeft(p)
                  const full = isProgramFull(p)
                  const registered = isProgramRegistered(index)
                  return (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {formatProgramDateTime(p.dateTime)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {p.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.capacity != null ? (
                          <span>
                            {p.currentAttendees ?? 0} / {p.capacity}
                            {spotsLeft != null && spotsLeft > 0 && (
                              <span className="ml-1 text-primary-600">({spotsLeft} left)</span>
                            )}
                            {full && (
                              <span className="ml-1 text-red-600">(Full)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.requiresRegistration ? (
                          onRegisterProgram ? (
                            registered ? (
                              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Registered
                              </span>
                            ) : full ? (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                Full
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onRegisterProgram(index)}
                                className="text-sm font-medium text-primary-600 hover:underline"
                              >
                                Register
                              </button>
                            )
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Registration required
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
