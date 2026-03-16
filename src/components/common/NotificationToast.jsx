export function NotificationToast({ title = 'Notification', body = '', url, onClose, isVisible = true }) {
  const handleNavigate = () => {
    if (!url) return
    if (onClose) onClose()
    try {
      window.location.href = url
    } catch {
      // ignore navigation errors
    }
  }

  return (
    <div
      className={[
        'pointer-events-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg ring-1 ring-black/5 transition-all',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        url ? 'cursor-pointer' : '',
      ].join(' ')}
      role="status"
      aria-live="polite"
      onClick={handleNavigate}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
          <svg
            className="h-5 w-5 text-primary-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">
            {title || 'Notification'}
          </p>
          {body ? (
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">{body}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {url ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNavigate()
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                View details
              </button>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
              className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="ml-2 inline-flex flex-shrink-0 items-center rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="Close notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
