"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Critical root-level application error:", error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="text-sm text-slate-600">
            A critical error occurred. Please refresh or try again later.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
