import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { getUserProfile } from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[useAuth] auth state changed', { uid: firebaseUser?.uid ?? null, email: firebaseUser?.email ?? null })
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
        console.log('[useAuth] profile loaded', { uid: firebaseUser.uid, role: p?.role })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, profile, loading, isOrganizer: profile?.role === 'organizer' || profile?.role === 'admin' }
}
