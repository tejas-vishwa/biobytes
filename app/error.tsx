"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error securely on the client/telemetry without exposing to the DOM
    console.error("Application runtime error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-600">
            An unexpected error occurred while processing your request. Our team has been notified.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
