import Link from "next/link"
import { Activity, LayoutDashboard, Users, Settings, LogOut } from "lucide-react"
import { BackButton } from "@/components/BackButton"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900/50">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight hidden md:inline-block">BioBytes e-health tracker</span>
        </Link>
        <nav className="flex-1 flex items-center space-x-6 ml-6">
          <Link href="/doctor/dashboard" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/doctor/access" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            Patient Access
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
