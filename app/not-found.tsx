import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          404
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Page Not Found</h2>
          <p className="text-sm text-slate-600">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
