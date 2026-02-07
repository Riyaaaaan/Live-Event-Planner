import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/authService'

export function Header() {
  const { user, profile, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-bold text-primary-600">
          Live Event Planner
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-primary-600'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-primary-600'
            }
          >
            Events
          </NavLink>
          {!loading && (
            <>
              {user ? (
                <>
                  {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                    <>
                      <NavLink
                        to="/create"
                        className={({ isActive }) =>
                          isActive ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-primary-600'
                        }
                      >
                        Create Event
                      </NavLink>
                      <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                          isActive ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-primary-600'
                        }
                      >
                        Dashboard
                      </NavLink>
                    </>
                  )}
                  <span className="text-sm text-gray-500">{profile?.displayName || user.email}</span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="btn-ghost text-sm"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
