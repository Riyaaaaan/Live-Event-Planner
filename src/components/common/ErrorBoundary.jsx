import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
          <h1 className="font-display text-2xl font-bold text-gray-800">Something went wrong</h1>
          <p className="text-gray-600">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
