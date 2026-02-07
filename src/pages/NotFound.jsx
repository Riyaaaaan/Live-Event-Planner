import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 font-display text-2xl font-bold text-gray-900">Page not found</h2>
      <p className="mt-2 text-gray-600">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn-primary mt-8 inline-block">
        Back to Home
      </Link>
    </main>
  )
}
