import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'

const USERS_COLLECTION = 'users'

export async function signUpWithEmail(email, password, displayName) {
  console.log('[authService] signUpWithEmail', { email, displayName: displayName || '(none)' })
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(user, { displayName })
  await setDoc(doc(db, USERS_COLLECTION, user.uid), {
    email: user.email,
    displayName: displayName || user.displayName || '',
    photoURL: user.photoURL || null,
    role: 'attendee',
    interests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('[authService] signUpWithEmail success', { uid: user.uid, email: user.email })
  return user
}

export async function signInWithEmail(email, password) {
  console.log('[authService] signInWithEmail', { email })
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  console.log('[authService] signInWithEmail success', { uid: user.uid })
  return user
}

export async function signInWithGoogle() {
  console.log('[authService] signInWithGoogle')
  const { user } = await signInWithPopup(auth, googleProvider)
  console.log('[authService] signInWithGoogle success', { uid: user.uid, email: user.email })
  const userRef = doc(db, USERS_COLLECTION, user.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      role: 'attendee',
      interests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  return user
}

export async function logout() {
  console.log('[authService] logout')
  await signOut(auth)
  console.log('[authService] logout success')
}

export async function resetPassword(email) {
  console.log('[authService] resetPassword', { email })
  await sendPasswordResetEmail(auth, email)
  console.log('[authService] resetPassword success')
}

export async function getUserProfile(uid) {
  console.log('[authService] getUserProfile', { uid })
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  const profile = snap.exists() ? { id: snap.id, ...snap.data() } : null
  console.log('[authService] getUserProfile result', { uid, hasProfile: !!profile, role: profile?.role })
  return profile
}
