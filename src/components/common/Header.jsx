import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/authService'

export function Header() {
  const { user, profile, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? 'font-medium text-primary-600'
      : 'text-gray-600 hover:text-primary-600'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-bold text-primary-600" onClick={closeMobileMenu}>
          Planora
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-primary-600 focus:outline-none lg:hidden"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          <NavLink to="/" className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/events" className={navLinkClasses}>
            Events
          </NavLink>
          {!loading && (
            <>
              {user ? (
                <>
                  {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                    <>
                      <NavLink to="/create" className={navLinkClasses}>
                        Create Event
                      </NavLink>
                      <NavLink to="/dashboard" className={navLinkClasses}>
                        Dashboard
                      </NavLink>
                      <NavLink to="/scan" className={navLinkClasses}>
                        Scanner
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

      {/* Mobile navigation menu */}
      <div
        className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <nav className="flex flex-col space-y-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'font-medium text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive
                  ? 'font-medium text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }
              onClick={closeMobileMenu}
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
                            isActive
                              ? 'font-medium text-primary-600'
                              : 'text-gray-600 hover:text-primary-600'
                          }
                          onClick={closeMobileMenu}
                        >
                          Create Event
                        </NavLink>
                        <NavLink
                          to="/dashboard"
                          className={({ isActive }) =>
                            isActive
                              ? 'font-medium text-primary-600'
                              : 'text-gray-600 hover:text-primary-600'
                          }
                          onClick={closeMobileMenu}
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/scan"
                          className={({ isActive }) =>
                            isActive
                              ? 'font-medium text-primary-600'
                              : 'text-gray-600 hover:text-primary-600'
                          }
                          onClick={closeMobileMenu}
                        >
                          Scanner
                        </NavLink>
                      </>
                    )}
                    <div className="border-t border-gray-100 pt-2">
                      <span className="block text-sm text-gray-500">{profile?.displayName || user.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          logout()
                          closeMobileMenu()
                        }}
                        className="btn-ghost mt-2 w-full justify-start text-sm text-red-600 hover:text-red-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-2">
                    <Link
                      to="/login"
                      className="btn-ghost w-full justify-center"
                      onClick={closeMobileMenu}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-primary w-full justify-center"
                      onClick={closeMobileMenu}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
