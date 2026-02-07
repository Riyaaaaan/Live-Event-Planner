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
