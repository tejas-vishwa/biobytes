import Link from "next/link"
import { BackButton } from "@/components/BackButton"
import { ThemeToggle } from "@/components/ThemeToggle"
import { QurixLogo } from "@/components/QurixLogo"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 md:px-6 justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center group transition-transform hover:scale-105">
            <QurixLogo className="h-8 w-auto" showTagline={true} />
          </Link>
          <nav className="flex items-center space-x-6 ml-6">
            <Link href="/doctor/dashboard" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/doctor/access" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Patient Access
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
