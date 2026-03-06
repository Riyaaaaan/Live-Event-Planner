import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return format(d, 'MMM d, yyyy · h:mm a')
}

export function formatRelative(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

/** Returns true if the event's start date day has already passed */
export function isEventPast(event) {
  const startDate = event?.startDate
  if (!startDate) return false
  const d = startDate instanceof Date ? new Date(startDate.getTime()) : new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}
