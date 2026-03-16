const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore')
const { defineString } = require('firebase-functions/params')

initializeApp()

const db = getFirestore()
const messaging = getMessaging()

// Optional: base URL for click action (e.g. https://yoursite.web.app)
const appBaseUrl = defineString('APP_BASE_URL', { default: '' })

function formatEventTime(value) {
  if (!value) return ''
  const d = value && value.toDate ? value.toDate() : new Date(value)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * When a user registers for an event, send a push: "Find the ticket inside the event details."
 */
exports.onRegistrationCreated = onDocumentCreated(
  'events/{eventId}/registrations/{registrationId}',
  async (event) => {
    const snapshot = event.data
    if (!snapshot) {
      console.log('[onRegistrationCreated] No data')
      return
    }
    const data = snapshot.data()
    const userId = data && data.userId
    console.log('[onRegistrationCreated] registration data', {
      eventId: event.params.eventId,
      registrationId: event.params.registrationId,
      userId,
      hasEmail: !!data?.email,
    })
    const eventId = event.params.eventId
    if (!userId) {
      console.log('[onRegistrationCreated] No userId in registration')
      return
    }
    const userRef = db.doc(`users/${userId}`)
    const userSnap = await userRef.get()
    const userData = userSnap.exists ? userSnap.data() : null
    const fcmToken = userData ? userData.fcmToken : null
    console.log('[onRegistrationCreated] user snapshot', {
      exists: userSnap.exists,
      hasFcmTokenField: !!(userData && Object.prototype.hasOwnProperty.call(userData, 'fcmToken')),
      hasFcmTokenValue: !!fcmToken,
    })
    if (!fcmToken) {
      console.log('[onRegistrationCreated] No fcmToken for user', userId)
      return
    }
    const baseUrl = appBaseUrl.value()
    const link = baseUrl ? `${baseUrl}/events/${eventId}` : undefined
    const message = {
      token: fcmToken,
      notification: {
        title: "You're registered",
        body: 'Find the ticket inside the event details.',
      },
      webpush: {
        fcmOptions: link ? { link } : undefined,
      },
    }
    try {
      await messaging.send(message)
      console.log('[onRegistrationCreated] Sent notification to', userId)
    } catch (err) {
      console.error('[onRegistrationCreated] Send failed', err)
      if (err && (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered')) {
        await userRef.update({ fcmToken: null })
      }
    }
  }
)

/**
 * When an event is updated, if start/end or program times changed, notify all registered users.
 */
exports.onEventUpdated = onDocumentUpdated(
  'events/{eventId}',
  async (event) => {
    const before = event.data && event.data.before && event.data.before.data()
    const after = event.data && event.data.after && event.data.after.data()
    if (!before || !after) return
    const eventId = event.params.eventId

    const timeChanged = () => {
      const startBefore = before.startDate && before.startDate.toMillis ? before.startDate.toMillis() : before.startDate
      const startAfter = after.startDate && after.startDate.toMillis ? after.startDate.toMillis() : after.startDate
      if (startBefore !== startAfter) return true
      const endBefore = before.endDate && before.endDate.toMillis ? before.endDate.toMillis() : before.endDate
      const endAfter = after.endDate && after.endDate.toMillis ? after.endDate.toMillis() : after.endDate
      if (endBefore !== endAfter) return true
      const progBefore = before.programs || []
      const progAfter = after.programs || []
      if (progBefore.length !== progAfter.length) return true
      for (let i = 0; i < progAfter.length; i++) {
        const a = progAfter[i] && progAfter[i].dateTime
        const b = progBefore[i] && progBefore[i].dateTime
        const aMs = a && a.toMillis ? a.toMillis() : (a ? new Date(a).getTime() : null)
        const bMs = b && b.toMillis ? b.toMillis() : (b ? new Date(b).getTime() : null)
        if (aMs !== bMs) return true
      }
      return false
    }

    if (!timeChanged()) {
      console.log('[onEventUpdated] No time change, skip notifications')
      return
    }

    const parts = []
    if (after.startDate) {
      parts.push(`Start: ${formatEventTime(after.startDate)}`)
    }
    if (after.endDate) {
      parts.push(`End: ${formatEventTime(after.endDate)}`)
    }
    const programTimes = (after.programs || [])
      .filter((p) => p && p.dateTime)
      .map((p, i) => `${p.title || 'Program ' + (i + 1)}: ${formatEventTime(p.dateTime)}`)
    if (programTimes.length) {
      parts.push(programTimes.join(' · '))
    }
    const body = parts.length
      ? `Event time updated. ${parts.join('. ')}`
      : 'Event time updated.'

    const registrationsSnap = await db
      .collection('events')
      .doc(eventId)
      .collection('registrations')
      .get()
    const userIds = [...new Set(registrationsSnap.docs.map((d) => d.data().userId).filter(Boolean))]
    if (userIds.length === 0) {
      console.log('[onEventUpdated] No registrations')
      return
    }

    const baseUrl = appBaseUrl.value()
    const link = baseUrl ? `${baseUrl}/events/${eventId}` : undefined
    const title = after.title ? `${after.title} – time changed` : 'Event time changed'

    for (const userId of userIds) {
      const userSnap = await db.doc(`users/${userId}`).get()
      const fcmToken = userSnap.exists ? userSnap.data().fcmToken : null
      if (!fcmToken) continue
      const message = {
        token: fcmToken,
        notification: { title, body },
        webpush: baseUrl && link ? { fcmOptions: { link } } : undefined,
      }
      try {
        await messaging.send(message)
        console.log('[onEventUpdated] Sent to', userId)
      } catch (err) {
        console.error('[onEventUpdated] Send failed for', userId, err)
        if (err && (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered')) {
          await db.doc(`users/${userId}`).update({ fcmToken: null })
        }
      }
    }
  }
)
