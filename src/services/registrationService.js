import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { getEvent, updateEvent } from './eventService'

const registrationsSub = (eventId) =>
  collection(db, 'events', eventId, 'registrations')

export async function isUserRegisteredForEvent(eventId, userId) {
  const q = query(registrationsSub(eventId), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

export async function registerForEvent(eventId, userId, ticketType = 'default', quantity = 1, userInfo = {}) {
  const { displayName = '', email = '' } = userInfo
  console.log('[registrationService] registerForEvent', { eventId, userId, ticketType, quantity })
  const event = await getEvent(eventId)
  if (!event) throw new Error('Event not found')
  if (event.currentAttendees + quantity > event.capacity)
    throw new Error('Not enough capacity')

  const alreadyRegistered = await isUserRegisteredForEvent(eventId, userId)
  if (alreadyRegistered) throw new Error("You're already registered for this event.")

  await addDoc(registrationsSub(eventId), {
    userId,
    eventId,
    displayName: displayName || null,
    email: email || null,
    ticketType,
    quantity,
    totalAmount: 0,
    paymentStatus: 'completed',
    checkInStatus: false,
    registeredAt: Timestamp.now(),
  })

  await updateEvent(eventId, {
    currentAttendees: (event.currentAttendees || 0) + quantity,
  })
  console.log('[registrationService] registerForEvent success', { eventId, userId })
}

export async function getRegistrationsForEvent(eventId) {
  console.log('[registrationService] getRegistrationsForEvent', { eventId })
  const q = query(registrationsSub(eventId), orderBy('registeredAt', 'asc'))
  const snapshot = await getDocs(q)
  const regs = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      registeredAt: data.registeredAt?.toDate?.() ?? data.registeredAt,
    }
  })
  console.log('[registrationService] getRegistrationsForEvent result', { eventId, count: regs.length })
  return regs
}

export async function getRegistrationsForUser(userId) {
  console.log('[registrationService] getRegistrationsForUser', { userId })
  const eventsSnap = await getDocs(collection(db, 'events'))
  const results = []
  for (const eventDoc of eventsSnap.docs) {
    const q = query(
      collection(db, 'events', eventDoc.id, 'registrations'),
      where('userId', '==', userId)
    )
    const regSnap = await getDocs(q)
    regSnap.docs.forEach((d) =>
      results.push({ id: d.id, eventId: eventDoc.id, ...d.data() })
    )
  }
  console.log('[registrationService] getRegistrationsForUser result', { userId, count: results.length })
  return results
}
