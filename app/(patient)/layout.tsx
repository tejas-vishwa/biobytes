import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { LayoutDashboard, LineChart, LogOut, UploadCloud, Calendar, HeartHandshake } from "lucide-react"
import { BackButton } from "@/components/BackButton"
import { QurixLogo } from "@/components/QurixLogo"

import { ThemeToggle } from "@/components/ThemeToggle"

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
        <Link href="/" className="flex items-center group transition-transform hover:scale-105">
          <QurixLogo className="h-8 w-auto" showTagline={true} />
        </Link>
        <nav className="flex-1 flex items-center space-x-4 md:space-x-6 ml-6 overflow-x-auto">
          <Link href="/patient/dashboard" className="text-sm font-medium transition-colors hover:text-primary flex items-center whitespace-nowrap">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Link>
          <Link href="/patient/upload" className="text-sm font-medium transition-colors hover:text-primary flex items-center whitespace-nowrap">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload
          </Link>
          <Link href="/patient/trends" className="text-sm font-medium transition-colors hover:text-primary flex items-center whitespace-nowrap">
            <LineChart className="mr-2 h-4 w-4" /> Trends
          </Link>
          <Link href="/patient/appointments" className="text-sm font-medium transition-colors hover:text-primary flex items-center whitespace-nowrap">
            <Calendar className="mr-2 h-4 w-4" /> Appointments
          </Link>
          <Link href="/patient/partners" className="text-sm font-medium transition-colors hover:text-primary flex items-center whitespace-nowrap">
            <HeartHandshake className="mr-2 h-4 w-4" /> Partners
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm font-medium hidden sm:inline-block">Hello, {session.user.name}</span>
          <Link href="/api/auth/signout" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Link>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
