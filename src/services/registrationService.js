import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
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

export async function isUserRegisteredForProgram(eventId, programIndex, userId) {
  const q = query(
    registrationsSub(eventId),
    where('userId', '==', userId),
    where('programIds', 'array-contains', programIndex)
  )
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

/**
 * Register for a single program (program-only registration, not event registration)
 * @param {string} eventId
 * @param {number} programIndex - The index of the program to register for
 * @param {string} userId
 * @param {{ displayName?: string, email?: string, phone?: string, class?: string, section?: string, branch?: string }} [userInfo]
 * @returns {Promise<string>} Registration document id
 */
export async function registerForProgram(eventId, programIndex, userId, userInfo = {}) {
  const { displayName = '', email = '', phone = '', class: userClass = '', section = '', branch = '' } = userInfo
  console.log('[registrationService] registerForProgram', { eventId, programIndex, userId })

  const event = await getEvent(eventId)
  if (!event) throw new Error('Event not found')

  const program = event.programs?.[programIndex]
  if (!program) throw new Error('Program not found')
  if (!program.requiresRegistration) throw new Error('This program does not require registration')
  if (program.capacity != null) {
    const currentCount = program.currentAttendees || 0
    if (currentCount >= program.capacity) throw new Error('This program is full')
  }

  const alreadyRegistered = await isUserRegisteredForProgram(eventId, programIndex, userId)
  if (alreadyRegistered) throw new Error("You're already registered for this program.")

  const ref = await addDoc(registrationsSub(eventId), {
    userId,
    eventId,
    displayName: displayName || null,
    email: email || null,
    phone: phone || null,
    class: userClass || null,
    section: section || null,
    branch: branch || null,
    ticketType: 'program',
    quantity: 1,
    totalAmount: 0,
    paymentStatus: 'completed',
    checkInStatus: false,
    programIds: [programIndex],
    registeredAt: Timestamp.now(),
  })

  await updateDoc(doc(db, 'events', eventId), {
    [`programs.${programIndex}.currentAttendees`]: increment(1),
  })

  console.log('[registrationService] registerForProgram success', { eventId, programIndex, userId, registrationId: ref.id })
  return ref.id
}

/**
 * @param {string} eventId
 * @param {string} userId
 * @param {string} [ticketType]
 * @param {number} [quantity]
 * @param {{ displayName?: string, email?: string, phone?: string, class?: string, section?: string, branch?: string }} [userInfo]
 * @param {number[]} [programIds] - Indices of programs (that require registration) the user is registering for
 * @returns {Promise<string>} Registration document id (for QR)
 */
export async function registerForEvent(eventId, userId, ticketType = 'default', quantity = 1, userInfo = {}, programIds = []) {
  const { displayName = '', email = '', phone = '', class: userClass = '', section = '', branch = '' } = userInfo
  console.log('[registrationService] registerForEvent', { eventId, userId, ticketType, quantity, programIds })
  const event = await getEvent(eventId)
  if (!event) throw new Error('Event not found')
  if (event.currentAttendees + quantity > event.capacity)
    throw new Error('Not enough capacity')

  const alreadyRegistered = await isUserRegisteredForEvent(eventId, userId)
  if (alreadyRegistered) throw new Error("You're already registered for this event.")

  const ref = await addDoc(registrationsSub(eventId), {
    userId,
    eventId,
    displayName: displayName || null,
    email: email || null,
    phone: phone || null,
    class: userClass || null,
    section: section || null,
    branch: branch || null,
    ticketType,
    quantity,
    totalAmount: 0,
    paymentStatus: 'completed',
    checkInStatus: false,
    programIds: Array.isArray(programIds) ? programIds : [],
    registeredAt: Timestamp.now(),
  })

  await updateEvent(eventId, {
    currentAttendees: (event.currentAttendees || 0) + quantity,
  })
  console.log('[registrationService] registerForEvent success', { eventId, userId, registrationId: ref.id })
  return ref.id
}

export async function getRegistrationById(eventId, registrationId) {
  const snap = await getDoc(doc(db, 'events', eventId, 'registrations', registrationId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    registeredAt: data.registeredAt?.toDate?.() ?? data.registeredAt,
  }
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
