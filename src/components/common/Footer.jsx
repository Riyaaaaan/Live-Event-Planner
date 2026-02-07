import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="font-display font-bold text-primary-600">
            Live Event Planner
          </Link>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link to="/events" className="hover:text-primary-600">Events</Link>
            <a href="mailto:support@eventplanner.com" className="hover:text-primary-600">Support</a>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Live Event Planner. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
