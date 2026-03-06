import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { getEvent } from '../services/eventService'
import { getRegistrationById, updateRegistrationCheckIn } from '../services/registrationService'
import { QRScanner } from '../components/common/QRScanner'
import { Loader } from '../components/common/Loader'
import toast from 'react-hot-toast'

function formatDateTime(dateStr) {
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

export function ScanTicket() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [eventId, setEventId] = useState(searchParams.get('eventId'))
  const [registrationId, setRegistrationId] = useState(searchParams.get('registrationId'))
  const [event, setEvent] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  useEffect(() => {
    if (eventId && registrationId) {
      loadTicketDetails(eventId, registrationId)
    }
  }, [eventId, registrationId])

  const loadTicketDetails = async (evtId, regId) => {
    setLoading(true)
    setError(null)
    try {
      const [eventData, regData] = await Promise.all([
        getEvent(evtId),
        getRegistrationById(evtId, regId),
      ])
      setEvent(eventData)
      setRegistration(regData)
      if (!eventData) setError('Event not found')
      if (!regData) setError('Registration not found')
    } catch (err) {
      console.error('Error loading ticket:', err)
      setError('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (scannedText) => {
    // Parse the scanned URL
    // Expected format: https://domain/verify/eventId/registrationId or just the IDs
    let evtId = eventId
    let regId = registrationId

    try {
      // Try to parse as full URL
      const url = new URL(scannedText)
      const pathParts = url.pathname.split('/').filter(Boolean)
      const verifyIndex = pathParts.indexOf('verify')

      if (verifyIndex !== -1 && pathParts.length >= verifyIndex + 3) {
        evtId = pathParts[verifyIndex + 1]
        regId = pathParts[verifyIndex + 2]
      } else if (scannedText.includes('/')) {
        // Try to parse as path
        const parts = scannedText.split('/').filter(Boolean)
        if (parts.length >= 2) {
          evtId = parts[parts.length - 2]
          regId = parts[parts.length - 1]
        }
      } else {
        // Assume it's just the registration ID or a combined format
        // This would need eventId from the current context
        setError('Please provide a valid event ticket URL or QR code')
        return
      }

      setEventId(evtId)
      setRegistrationId(regId)
      setSearchParams({ eventId: evtId, registrationId: regId })
    } catch (err) {
      // If URL parsing fails, try simple parsing
      const parts = scannedText.split('/').filter(Boolean)
      if (parts.length >= 2) {
        setEventId(parts[parts.length - 2])
        setRegistrationId(parts[parts.length - 1])
        setSearchParams({ eventId: parts[parts.length - 2], registrationId: parts[parts.length - 1] })
      } else {
        setError('Invalid QR code format')
      }
    }
  }

  const handleCheckIn = async () => {
    if (!eventId || !registrationId) return
    setIsCheckingIn(true)
    try {
      await updateRegistrationCheckIn(eventId, registrationId, true)
      setRegistration((prev) => ({ ...prev, checkInStatus: true }))
      toast.success('Check-in successful!')
    } catch (err) {
      console.error('Check-in error:', err)
      toast.error('Failed to check in. Please try again.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleManualEntry = () => {
    const evtId = prompt('Enter Event ID:')
    const regId = prompt('Enter Registration ID:')
    if (evtId && regId) {
      setEventId(evtId)
      setRegistrationId(regId)
      setSearchParams({ eventId: evtId, registrationId: regId })
    }
  }

  const getPrograms = () => {
    if (!event?.programs || !registration?.programIds) return []
    return registration.programIds
      .map((index) => event.programs[index])
      .filter(Boolean)
  }

  const registeredPrograms = getPrograms()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  // Show scanner when no ticket is loaded
  if (!event || !registration) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Scan Event Ticket</h1>
          <p className="mt-2 text-gray-600">Point your camera at a ticket QR code to verify registration</p>
        </div>

        <QRScanner onScan={handleScan} onError={(err) => console.error(err)} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handleManualEntry}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Or enter ticket details manually
          </button>
        </div>
      </div>
    )
  }

  const ticketType = registration.ticketType === 'program' ? 'Program Pass' : 'Event Pass'

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          registration.checkInStatus
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {registration.checkInStatus ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Already Checked In</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Valid Ticket</span>
            </>
          )}
        </div>
      </div>

      {/* Event Info Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h1 className="font-display text-xl font-bold text-white">{event.title}</h1>
          <p className="text-primary-100 mt-1">{event.category}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date & Time</p>
              <p className="text-gray-900">{formatDateTime(event.startDate)}</p>
              {event.endDate && event.endDate !== event.startDate && (
                <p className="text-sm text-gray-500">to {formatDateTime(event.endDate)}</p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location?.type === 'physical' && event.location?.address && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{event.location.address}</p>
              </div>
            </div>
          )}

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Attendee Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Attendee Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                <p className="text-gray-900 font-medium">{registration.displayName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-gray-900">{registration.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-gray-900">{registration.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket Type</p>
                <p className="text-gray-900">{ticketType}</p>
              </div>
            </div>

            {/* Class Info for Private Events */}
            {(registration.class || registration.section || registration.branch) && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class</p>
                  <p className="text-gray-900">{registration.class || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Section</p>
                  <p className="text-gray-900">{registration.section || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</p>
                  <p className="text-gray-900">{registration.branch || '-'}</p>
                </div>
              </div>
            )}

            {/* Registered Programs */}
            {registeredPrograms.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Registered Programs</p>
                <ul className="space-y-2">
                  {registeredPrograms.map((program, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-gray-900">{program.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ticket ID */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket ID</p>
                <p className="font-mono text-lg font-bold text-gray-900">{registration.id?.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered On</p>
                <p className="text-gray-900">{formatDateTime(registration.registeredAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!registration.checkInStatus && (
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
        >
          {isCheckingIn ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking In...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Check In Attendee
            </>
          )}
        </button>
      )}

      {/* Scan Another */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setEvent(null)
            setRegistration(null)
            setEventId(null)
            setRegistrationId(null)
            setSearchParams({})
            setError(null)
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Scan Another Ticket
        </button>
      </div>
    </div>
  )
}
