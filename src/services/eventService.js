import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const EVENTS_COLLECTION = 'events'

function toEvent(docSnap) {
  if (!docSnap.exists()) return null
  const d = docSnap.data()
  return {
    id: docSnap.id,
    ...d,
    startDate: d.startDate?.toDate?.() ?? d.startDate,
    endDate: d.endDate?.toDate?.() ?? d.endDate,
    registrationDeadline: d.registrationDeadline?.toDate?.() ?? d.registrationDeadline,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
  }
}

function toTimestamp(date) {
  if (date instanceof Date) return Timestamp.fromDate(date)
  if (typeof date === 'string') return Timestamp.fromDate(new Date(date))
  return date
}

export async function createEvent(eventData) {
  console.log('[eventService] createEvent', { title: eventData.title, organizerId: eventData.organizerId })
  const payload = {
    ...eventData,
    startDate: toTimestamp(eventData.startDate),
    endDate: toTimestamp(eventData.endDate),
    registrationDeadline: eventData.registrationDeadline
      ? toTimestamp(eventData.registrationDeadline)
      : null,
    currentAttendees: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  const ref = await addDoc(collection(db, EVENTS_COLLECTION), payload)
  console.log('[eventService] createEvent success', { eventId: ref.id })
  return ref.id
}

export async function getEvent(id) {
  console.log('[eventService] getEvent', { id })
  const snap = await getDoc(doc(db, EVENTS_COLLECTION, id))
  const event = toEvent(snap)
  console.log('[eventService] getEvent result', { id, found: !!event, title: event?.title })
  return event
}

export async function getEvents(filters = {}) {
  console.log('[eventService] getEvents', { filters })
  const q = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('startDate', 'asc'),
    limit(filters.limit ?? 100)
  )
  const snapshot = await getDocs(q)
  const events = snapshot.docs
    .map((d) => toEvent(d))
    .filter((e) => e.status === 'published' && e.visibility === 'public')
  console.log('[eventService] getEvents result', { count: events.length, ids: events.map((e) => e.id) })
  return events
}

export async function getEventsByOrganizer(organizerId) {
  console.log('[eventService] getEventsByOrganizer', { organizerId })
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('organizerId', '==', organizerId),
    limit(100)
  )
  const snapshot = await getDocs(q)
  const events = snapshot.docs.map((d) => toEvent(d))
  events.sort((a, b) => (b.startDate?.getTime?.() ?? 0) - (a.startDate?.getTime?.() ?? 0))
  console.log('[eventService] getEventsByOrganizer result', { organizerId, count: events.length })
  return events
}

export async function updateEvent(id, updates) {
  console.log('[eventService] updateEvent', { id, keys: Object.keys(updates) })
  const ref = doc(db, EVENTS_COLLECTION, id)
  const payload = { ...updates, updatedAt: Timestamp.now() }
  if (payload.startDate) payload.startDate = toTimestamp(payload.startDate)
  if (payload.endDate) payload.endDate = toTimestamp(payload.endDate)
  if (payload.registrationDeadline)
    payload.registrationDeadline = toTimestamp(payload.registrationDeadline)
  await updateDoc(ref, payload)
  console.log('[eventService] updateEvent success', { id })
}

export async function deleteEvent(id) {
  console.log('[eventService] deleteEvent', { id })
  await deleteDoc(doc(db, EVENTS_COLLECTION, id))
  console.log('[eventService] deleteEvent success', { id })
}
