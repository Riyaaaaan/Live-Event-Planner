import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDateTime } from '../../utils/formatters'

function formatTicketDateTime(dateStr) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function Ticket({ event, registration, verifyUrl }) {
  const [isEnlarged, setIsEnlarged] = useState(false)
  const ticketId = registration?.id?.slice(-8).toUpperCase() || '----'
  const attendeeName = registration?.displayName || 'Guest'
  const ticketType = registration?.ticketType === 'program' ? 'Program Pass' : 'Event Pass'

  const programs = event?.programs ?? []
  const registeredPrograms = (registration?.programIds ?? [])
    .map((index) => programs[index])
    .filter(Boolean)

  const handleTicketClick = () => {
    setIsEnlarged(true)
  }

  const handleCloseEnlarged = (e) => {
    e.stopPropagation()
    setIsEnlarged(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsEnlarged(false)
    }
  }

  return (
    <>
      <div
        className="mx-auto max-w-md px-2 sm:px-0 cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={handleTicketClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleTicketClick()}
      >
        {/* Ticket Container */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-bold text-white sm:text-xl truncate">
                  {event?.title || 'Event'}
                </h1>
                <p className="mt-1 text-sm text-primary-100">{event?.category || 'Event'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium uppercase tracking-wide text-primary-200">KMEA</p>
                <p className="text-xs text-primary-200">Event Ticket</p>
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-3 border-b border-dashed border-gray-300 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{formatTicketDateTime(event?.startDate)}</p>
                {event?.endDate && event?.endDate !== event?.startDate && (
                  <p className="text-xs text-gray-500">to {formatTicketDateTime(event?.endDate)}</p>
                )}
              </div>
            </div>

            {event?.location?.type === 'physical' && event?.location?.address && (
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{event.location.address}</p>
              </div>
            )}

            {registeredPrograms.length > 0 && (
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {registeredPrograms.length === 1
                      ? registeredPrograms[0].title
                      : `${registeredPrograms.length} Programs Registered`}
                  </p>
                  {registeredPrograms.length > 1 && (
                    <ul className="mt-1 text-xs text-gray-500">
                      {registeredPrograms.slice(0, 3).map((p, idx) => (
                        <li key={idx}>• {p.title}</li>
                      ))}
                      {registeredPrograms.length > 3 && (
                        <li className="italic">+{registeredPrograms.length - 3} more</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attendee & QR Section */}
          <div className="flex flex-col-reverse items-center justify-between gap-4 bg-white px-4 py-6 sm:flex-row sm:px-6">
            <div className="flex-1 w-full sm:w-auto">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Attendee</p>
              <p className="mt-1 font-semibold text-gray-900 truncate">{attendeeName}</p>
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ticket ID</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">{ticketId}</p>
              </div>
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                  {ticketType}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="relative flex-shrink-0 order-first sm:order-last">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300"></div>
              <div className="rounded-full border-4 border-white bg-white p-1 shadow-sm">
                {verifyUrl && (
                  <QRCodeSVG
                    value={verifyUrl}
                    size={100}
                    level="M"
                    includeMargin={false}
                    bgColor="transparent"
                    fgColor="#1f2937"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-4 py-3 text-center sm:px-6">
            <p className="text-xs text-gray-500">Tap to enlarge • Present this QR code at the entrance</p>
          </div>
        </div>
      </div>

      {/* Enlarged Ticket Modal */}
      {isEnlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-lg w-full animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button
              onClick={handleCloseEnlarged}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
              aria-label="Close enlarged ticket"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Enlarged Ticket Container */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="font-display text-2xl font-bold text-white truncate">
                      {event?.title || 'Event'}
                    </h1>
                    <p className="mt-1 text-primary-100">{event?.category || 'Event'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium uppercase tracking-wide text-primary-200">KMEA</p>
                    <p className="text-sm text-primary-200">Event Ticket</p>
                  </div>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="space-y-4 border-b border-dashed border-gray-300 bg-gray-50 px-6 py-5">
                <div className="flex items-start gap-4">
                  <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{formatTicketDateTime(event?.startDate)}</p>
                    {event?.endDate && event?.endDate !== event?.startDate && (
                      <p className="text-sm text-gray-500">to {formatTicketDateTime(event?.endDate)}</p>
                    )}
                  </div>
                </div>

                {event?.location?.type === 'physical' && event?.location?.address && (
                  <div className="flex items-start gap-4">
                    <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">{event.location.address}</p>
                  </div>
                )}

                {registeredPrograms.length > 0 && (
                  <div className="flex items-start gap-4">
                    <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {registeredPrograms.length === 1
                          ? registeredPrograms[0].title
                          : `${registeredPrograms.length} Programs Registered`}
                      </p>
                      {registeredPrograms.length > 1 && (
                        <ul className="mt-2 text-gray-600">
                          {registeredPrograms.map((p, idx) => (
                            <li key={idx} className="text-sm">• {p.title}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Attendee & QR Section */}
              <div className="flex flex-col items-center justify-between gap-6 bg-white px-6 py-8">
                <div className="text-center w-full">
                  <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Attendee</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{attendeeName}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Ticket ID</p>
                    <p className="mt-1 font-mono text-xl font-bold text-gray-900">{ticketId}</p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-800">
                      {ticketType}
                    </span>
                  </div>
                </div>

                {/* Large QR Code */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300"></div>
                  <div className="rounded-full border-8 border-white bg-white p-2 shadow-lg">
                    {verifyUrl && (
                      <QRCodeSVG
                        value={verifyUrl}
                        size={200}
                        level="M"
                        includeMargin={false}
                        bgColor="transparent"
                        fgColor="#1f2937"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-100 px-6 py-4 text-center">
                <p className="text-gray-600">Present this QR code at the entrance</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
