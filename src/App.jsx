import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { useAuth } from './hooks/useAuth'
import { subscribeToForegroundMessages } from './services/messagingService'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { VerifyRegistration } from './pages/VerifyRegistration'
import { ScanTicket } from './pages/ScanTicket'
import { CreateEvent } from './pages/CreateEvent'
import { EditEvent } from './pages/EditEvent'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'
import { Login } from './components/auth/Login'
import { Signup } from './components/auth/Signup'
import { PasswordReset } from './components/auth/PasswordReset'

function ForegroundNotificationSubscriber() {
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    let mounted = true
    let unsub = () => {}
    subscribeToForegroundMessages((payload) => {
      const title = payload.notification?.title || 'Notification'
      const body = payload.notification?.body || ''
      toast(`${title}${body ? `: ${body}` : ''}`, { duration: 5000 })
    }).then((fn) => {
      if (mounted) unsub = fn
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [user])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ForegroundNotificationSubscriber />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/:id/edit" element={<EditEvent />} />
              <Route path="/verify/:eventId/:registrationId" element={<VerifyRegistration />} />
              <Route path="/scan" element={<ScanTicket />} />
              <Route path="/create" element={<CreateEvent />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<PasswordReset />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
