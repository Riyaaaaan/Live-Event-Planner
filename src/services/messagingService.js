import { getToken, onMessage } from 'firebase/messaging'
import { doc, updateDoc } from 'firebase/firestore'
import { getMessagingInstance } from './firebase'
import { db } from './firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

/**
 * Request notification permission, get FCM token, and save to users/{uid}.fcmToken.
 * Call when user is signed in. Merges so other user fields are not overwritten.
 * @param {string} uid - Current user id
 * @returns {Promise<string|null>} FCM token or null
 */
export async function initAndSaveFcmToken(uid) {
  if (!uid || !VAPID_KEY) {
    console.log('[messagingService] initAndSaveFcmToken skipped', { hasUid: !!uid, hasVapid: !!VAPID_KEY })
    return null
  }
  try {
    const messaging = await getMessagingInstance()
    if (!messaging) {
      console.log('[messagingService] Messaging not supported')
      return null
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('[messagingService] Permission not granted', permission)
      return null
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    console.log('[messagingService] getToken result', { hasToken: !!token, token: token ? token.substring(0, 12) + '...' : null })
    if (!token) {
      console.log('[messagingService] No token from getToken')
      return null
    }
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { fcmToken: token })
    console.log('[messagingService] fcmToken saved for', uid)
    return token
  } catch (err) {
    console.error('[messagingService] initAndSaveFcmToken error', err)
    return null
  }
}

/**
 * Subscribe to foreground messages. Call with a callback to show in-app toast etc.
 * @param {(payload: import('firebase/messaging').MessagePayload) => void} callback
 * @returns {Promise<() => void>} Unsubscribe function
 */
export async function subscribeToForegroundMessages(callback) {
  const messaging = await getMessagingInstance()
  if (!messaging) return () => {}
  return onMessage(messaging, callback)
}
